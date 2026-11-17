(function(root){
'use strict';

const STATUS_ORDER = { open: 0, upcoming: 1, ongoing: 2, unknown: 3, paused: 4, closed: 5 };
const STATUS_LABELS = {
  open: 'Atvērta pieteikšanās',
  upcoming: 'Drīzumā plānota',
  ongoing: 'Pastāvīga vai regulāra programma',
  paused: 'Pagaidām apturēta',
  closed: 'Pieteikšanās noslēgusies',
  unknown: 'Informācija nav pārbaudīta'
};
const SUPPORT_LABELS = {
  grant: 'Grants',
  subsidy: 'Subsīdija',
  loan: 'Aizdevums — jāatmaksā',
  guarantee: 'Garantija',
  equity: 'Kapitāla ieguldījums',
  capital_rebate: 'Kapitāla atlaide',
  tax_relief: 'Nodokļu atvieglojums',
  non_financial: 'Nefinansiāls atbalsts',
  prize: 'Balva',
  procurement: 'Publiskais iepirkums'
};

function list(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined && String(item).trim() !== '');
  return value === null || value === undefined || value === '' ? [] : [value];
}

function normalise(value) {
  return String(value === null || value === undefined ? '' : value)
    .trim()
    .toLocaleLowerCase('lv-LV')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function cleanCode(value) {
  return String(value || '').trim().replace(/\s+/g, '').replace(',', '.');
}

function uniqueProfiles(items) {
  const seen = new Set();
  const profiles = [];
  items.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const profile = {
      sector: String(item.sector || '').trim(),
      activity: String(item.activity || item.job || '').trim(),
      nace: cleanCode(item.nace || item.naceCode || ''),
      legalForm: String(item.legalForm || '').trim(),
      stage: String(item.stage || '').trim(),
      region: String(item.region || '').trim(),
      goals: list(item.goals).map(String)
    };
    if (!profile.sector && !profile.activity && !profile.nace) return;
    const key = [profile.sector, profile.activity, profile.nace, profile.legalForm, profile.stage, profile.region].join('|').toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    profiles.push(profile);
  });
  return profiles;
}

function getLocalIndustryProfiles(storage) {
  let store = storage;
  if (!store) {
    try { store = root.localStorage; } catch (_) { return []; }
  }
  if (!store || typeof store.getItem !== 'function') return [];
  const read = key => {
    try {
      const raw = store.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  };
  const saved = read('mansdarbs_industry_profiles_v1');
  const current = read('mansdarbs_industry_profile_v1');
  const profiles = [];
  if (Array.isArray(saved)) profiles.push(...saved);
  if (current && typeof current === 'object' && !Array.isArray(current)) profiles.push(current);
  return uniqueProfiles(profiles);
}

function dateStatus(program, today) {
  const original = STATUS_ORDER[program.status] === undefined ? 'unknown' : program.status;
  if (original === 'paused' || original === 'closed' || original === 'unknown') return original;
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(String(program.deadline || '')) ? program.deadline : '';
  const opening = /^\d{4}-\d{2}-\d{2}$/.test(String(program.openingDate || '')) ? program.openingDate : '';
  if (deadline && deadline < today) return 'closed';
  if (opening && opening > today) return 'upcoming';
  if (opening && opening <= today && (!deadline || deadline >= today)) return 'open';
  return original;
}

function matchesNace(profileCode, program) {
  const code = cleanCode(profileCode);
  if (!code) return null;
  const exact = list(program.naceCodes).map(cleanCode);
  const prefixes = list(program.nacePrefixes).map(cleanCode);
  if (!exact.length && !prefixes.length) return null;
  return exact.includes(code) || prefixes.some(prefix => prefix && code.startsWith(prefix));
}

function hasValue(profile, key) {
  const value = profile[key];
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';
}

function evaluate(program, profile) {
  const reasons = [];
  const missing = [];
  const sector = normalise(profile.sector);
  const activity = normalise(profile.activity || profile.job);
  const nace = cleanCode(profile.nace || profile.naceCode);
  const programSectors = list(program.sectors).map(normalise);
  const programActivities = list(program.activities).map(normalise);
  const activityKeywords = list(program.activityKeywords).map(normalise);
  const excludedSectors = list(program.excludedSectors).map(normalise);
  const excludedPrefixes = list(program.excludedNacePrefixes).map(cleanCode);

  if (sector && excludedSectors.includes(sector)) {
    return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Nozare norādīta kā izslēgta.'], missing };
  }
  if (nace && excludedPrefixes.some(prefix => prefix && nace.startsWith(prefix))) {
    return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['NACE kods ietilpst izslēgtajā darbību grupā.'], missing };
  }

  let sectorMatch = false;
  let activityMatch = false;
  let naceMatch = null;

  if (programSectors.length) {
    if (!sector) missing.push('nozare');
    else if (programSectors.includes(sector)) {
      sectorMatch = true;
      reasons.push('Nozare atbilst programmas norādītajai mērķauditorijai.');
    } else {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Programma nav paredzēta norādītajai nozarei.'], missing };
    }
  }

  if (programActivities.length || activityKeywords.length) {
    if (!activity) missing.push('konkrētā nodarbošanās');
    else if (programActivities.includes(activity) || activityKeywords.some(keyword => keyword && activity.includes(keyword))) {
      activityMatch = true;
      reasons.push('Konkrētā nodarbošanās atbilst programmas aprakstam.');
    } else if (program.scope === 'sector') {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Konkrētā darbība nav norādīta kā attiecināma.'], missing };
    } else {
      missing.push('attiecināmās darbības precizējums');
    }
  }

  if (list(program.naceCodes).length || list(program.nacePrefixes).length) {
    if (!nace) missing.push('NACE kods');
    else {
      naceMatch = matchesNace(nace, program);
      if (!naceMatch) return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['NACE kods neatbilst programmas norādītajiem kodiem.'], missing };
      reasons.push('NACE kods atbilst programmas norādītajam kodam vai kodu grupai.');
    }
  }

  const rules = program.eligibility || {};
  const allowedForms = list(rules.legalForms).map(normalise);
  const excludedForms = list(rules.excludedLegalForms).map(normalise);
  if (excludedForms.length) {
    if (!hasValue(profile, 'legalForm')) missing.push('uzņēmējdarbības forma');
    else if (excludedForms.includes(normalise(profile.legalForm))) {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Norādītā uzņēmējdarbības forma ir izslēgta.'], missing };
    }
  }
  if (allowedForms.length) {
    if (!hasValue(profile, 'legalForm')) missing.push('uzņēmējdarbības forma');
    else if (!allowedForms.includes(normalise(profile.legalForm))) {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Programma nepieļauj norādīto uzņēmējdarbības formu.'], missing };
    } else reasons.push('Uzņēmējdarbības forma atbilst norādītajiem nosacījumiem.');
  }

  const allowedStages = list(rules.stages).map(normalise);
  if (allowedStages.length) {
    if (!hasValue(profile, 'stage')) missing.push('uzņēmuma stadija');
    else if (!allowedStages.includes(normalise(profile.stage))) {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Uzņēmuma stadija neatbilst programmas nosacījumiem.'], missing };
    } else reasons.push('Uzņēmuma stadija atbilst norādītajiem nosacījumiem.');
  }

  const allowedRegions = list(rules.regions).map(normalise);
  if (allowedRegions.length) {
    if (!hasValue(profile, 'region')) missing.push('darbības reģions');
    else if (!allowedRegions.includes(normalise(profile.region))) {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Programma nav pieejama norādītajā reģionā.'], missing };
    } else reasons.push('Darbības reģions atbilst programmas nosacījumiem.');
  }

  const allowedGoals = list(program.goals).map(normalise);
  const userGoals = list(profile.goals).map(normalise);
  if (allowedGoals.length) {
    if (!userGoals.length) missing.push('atbalsta mērķis');
    else if (!userGoals.some(goal => allowedGoals.includes(goal))) {
      return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Programmas atbalsta mērķis nesakrīt ar norādīto vajadzību.'], missing };
    } else reasons.push('Programmas atbalsta mērķis sakrīt ar lietotāja vajadzību.');
  }

  list(rules.requiredProfileFields).forEach(key => {
    if (!hasValue(profile, key)) missing.push(String(key));
  });

  const sectorSpecific = program.scope === 'sector';
  const directMatch = sectorMatch || activityMatch || naceMatch === true;
  if (sectorSpecific && !directMatch && !missing.length) {
    return { fitStatus: 'likely_not_eligible', matchType: 'none', score: 0, reasons: ['Nav atrasta tieša sakritība ar nozares vai darbības kritērijiem.'], missing };
  }

  if (sectorSpecific && !directMatch) missing.push('nozares atbilstības precizējums');
  if (directMatch) reasons.push('Atrasta tieša sakritība ar nozares vai darbības kritērijiem.');
  if (!reasons.length) reasons.push('Programma ir starpnozaru; jāpārbauda konkrētās atlases nolikums.');

  const matchType = sectorSpecific ? 'sector_specific' : 'cross_sector';
  const score = (directMatch ? 50 : 20) + (sectorMatch ? 15 : 0) + (activityMatch ? 15 : 0) + (naceMatch === true ? 20 : 0) - missing.length * 5;
  return {
    fitStatus: missing.length ? 'needs_more_info' : 'potential_match',
    matchType,
    score: Math.max(0, score),
    reasons,
    missing: [...new Set(missing)]
  };
}

function getFundingMatches(profile, catalog, options) {
  const user = profile && typeof profile === 'object' ? profile : {};
  const data = Array.isArray(catalog) ? { programs: catalog, sources: [] } : (catalog || {});
  const programs = Array.isArray(data.programs) ? data.programs : [];
  const sources = Array.isArray(data.sources) ? data.sources : [];
  const sourceById = new Map(sources.map(source => [source.id, source]));
  const today = options && /^\d{4}-\d{2}-\d{2}$/.test(String(options.today || '')) ? options.today : new Date().toISOString().slice(0, 10);
  const includeClosed = Boolean(options && options.includeClosed);
  const results = [];

  for (const program of programs) {
    if (!program || typeof program !== 'object' || !program.id || !program.name) continue;
    const status = dateStatus(program, today);
    if (!includeClosed && (status === 'closed' || status === 'paused')) continue;
    const fit = evaluate(program, user);
    if (fit.fitStatus === 'likely_not_eligible') continue;
    const source = sourceById.get(program.sourceId) || null;
    results.push({
      ...program,
      status,
      statusLabel: STATUS_LABELS[status],
      supportTypeLabels: list(program.supportTypes).map(type => SUPPORT_LABELS[type] || type),
      sourceName: source ? source.name : (program.sourceName || ''),
      sourceUrl: source ? source.url : (program.sourceUrl || ''),
      ...fit
    });
  }

  results.sort((a, b) =>
    (a.matchType === 'sector_specific' ? 0 : 1) - (b.matchType === 'sector_specific' ? 0 : 1) ||
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
    b.score - a.score ||
    String(a.name).localeCompare(String(b.name), 'lv')
  );
  return results;
}

function getLocalFundingMatches(catalog, options) {
  const profiles = getLocalIndustryProfiles(options && options.storage);
  const byId = new Map();
  profiles.forEach(profile => {
    getFundingMatches(profile, catalog, options).forEach(match => {
      const matchedProfile = {
        sector: profile.sector,
        activity: profile.activity,
        nace: profile.nace
      };
      const existing = byId.get(match.id);
      if (!existing) {
        byId.set(match.id, { ...match, matchedProfiles: [matchedProfile], profileMatchCount: 1 });
        return;
      }
      const profileKey = [matchedProfile.sector, matchedProfile.activity, matchedProfile.nace].join('|');
      if (!existing.matchedProfiles.some(item => [item.sector, item.activity, item.nace].join('|') === profileKey)) {
        existing.matchedProfiles.push(matchedProfile);
        existing.profileMatchCount = existing.matchedProfiles.length;
      }
      if (match.fitStatus === 'potential_match' && existing.fitStatus !== 'potential_match' || match.score > existing.score) {
        Object.assign(existing, match);
        existing.matchedProfiles = existing.matchedProfiles || [matchedProfile];
        existing.profileMatchCount = existing.matchedProfiles.length;
      }
    });
  });
  return [...byId.values()].sort((a, b) =>
    (a.matchType === 'sector_specific' ? 0 : 1) - (b.matchType === 'sector_specific' ? 0 : 1) ||
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
    b.score - a.score ||
    String(a.name).localeCompare(String(b.name), 'lv')
  );
}

async function loadFundingCatalog(fetcher) {
  const request = fetcher || root.fetch;
  if (typeof request !== 'function') throw new Error('Funding catalogue fetch is unavailable');
  const response = await request('/funding-programs.json', {
    headers: { Accept: 'application/json' }
  });
  if (!response || !response.ok) throw new Error('Funding catalogue could not be loaded');
  const catalog = await response.json();
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.programs)) {
    throw new Error('Funding catalogue has an unsupported format');
  }
  return catalog;
}

async function findLocalFundingMatches(options) {
  const settings = options || {};
  const catalog = await loadFundingCatalog(settings.fetcher);
  return getLocalFundingMatches(catalog, settings);
}

root.MansdarbsFunding = Object.freeze({
  getLocalIndustryProfiles,
  getFundingMatches,
  getLocalFundingMatches,
  loadFundingCatalog,
  findLocalFundingMatches,
  statusLabels: Object.freeze({ ...STATUS_LABELS }),
  supportTypeLabels: Object.freeze({ ...SUPPORT_LABELS })
});
})(typeof window !== 'undefined' ? window : globalThis);
