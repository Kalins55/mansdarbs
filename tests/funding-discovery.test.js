const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'funding-discovery.js'), 'utf8');
const api = new Function('window', source + '; return window.MansdarbsFunding;')({});

function program(overrides = {}) {
  return {
    id: 'sector-grant',
    name: 'Nozares investīciju atbalsts',
    sourceId: 'lad-support-catalogue',
    scope: 'sector',
    sectors: ['agri'],
    supportTypes: ['grant'],
    status: 'open',
    openingDate: '2026-11-01',
    deadline: '2026-12-10',
    eligibility: { legalForms: ['Z/S', 'SIA'] },
    ...overrides
  };
}

const sourceRegistry = {
  sources: [{
    id: 'lad-support-catalogue',
    name: 'LAD',
    url: 'https://www.lad.gov.lv/lv/katalogs'
  }]
};

test('local industry profiles are read from browser storage without changing it', () => {
  const values = {
    mansdarbs_industry_profiles_v1: JSON.stringify([
      { sector: 'agri', job: 'Augkopība' },
      { sector: 'repair', job: 'Traktoru remonts' },
      { sector: 'agri', job: 'Augkopība' }
    ]),
    mansdarbs_industry_profile_v1: JSON.stringify({ sector: 'agri', job: 'Augkopība' })
  };
  const storage = { getItem: key => values[key] || null, setItem: () => assert.fail('must not write to storage') };
  const profiles = api.getLocalIndustryProfiles(storage);
  assert.equal(profiles.length, 2);
  assert.equal(profiles[0].activity, 'Augkopība');
  assert.equal(profiles[1].sector, 'repair');
});

test('sector-specific opportunities rank ahead of cross-sector opportunities', () => {
  const direct = program();
  const general = program({
    id: 'digital-grant',
    name: 'Digitalizācijas atbalsts',
    scope: 'cross_sector',
    sectors: [],
    goals: ['digitalisation']
  });
  const matches = api.getFundingMatches(
    { sector: 'agri', activity: 'Augkopība', legalForm: 'Z/S', goals: ['digitalisation'] },
    { programs: [general, direct], sources: sourceRegistry.sources },
    { today: '2026-11-17' }
  );
  assert.deepEqual(matches.map(item => item.id), ['sector-grant', 'digital-grant']);
  assert.equal(matches[0].matchType, 'sector_specific');
  assert.equal(matches[1].matchType, 'cross_sector');
});

test('programs for a different sector are not presented as relevant matches', () => {
  const matches = api.getFundingMatches(
    { sector: 'repair', activity: 'Traktoru remonts', legalForm: 'Saimnieciskās darbības veicējs' },
    { programs: [program()], sources: [] },
    { today: '2026-11-17' }
  );
  assert.equal(matches.length, 0);
});

test('NACE code prefix matching requires a declared matching prefix', () => {
  const item = program({ nacePrefixes: ['01.1'] });
  const yes = api.getFundingMatches({ sector: 'agri', nace: '01.11', legalForm: 'Z/S' }, [item], { today: '2026-11-17' });
  const no = api.getFundingMatches({ sector: 'agri', nace: '33.12', legalForm: 'Z/S' }, [item], { today: '2026-11-17' });
  assert.equal(yes.length, 1);
  assert.equal(no.length, 0);
});

test('missing legal form is explained rather than treated as automatic eligibility', () => {
  const matches = api.getFundingMatches({ sector: 'agri' }, [program()], { today: '2026-11-17' });
  assert.equal(matches[0].fitStatus, 'needs_more_info');
  assert.ok(matches[0].missing.includes('uzņēmējdarbības forma'));
});

test('excluded legal forms are not shown as eligible opportunities', () => {
  const item = program({ eligibility: { excludedLegalForms: ['fiziska persona'] } });
  const matches = api.getFundingMatches({ sector: 'agri', legalForm: 'Fiziska persona' }, [item], { today: '2026-11-17' });
  assert.equal(matches.length, 0);
});

test('upcoming and expired application windows are calculated from dates', () => {
  const upcoming = program({ openingDate: '2026-12-01', deadline: '2026-12-31', status: 'upcoming' });
  const expired = program({ deadline: '2026-11-16' });
  const matches = api.getFundingMatches({ sector: 'agri', legalForm: 'Z/S' }, [upcoming, expired], { today: '2026-11-17' });
  assert.equal(matches.length, 1);
  assert.equal(matches[0].status, 'upcoming');
  assert.equal(matches[0].statusLabel, 'Drīzumā plānota');
});

test('loans remain clearly labelled as repayable support', () => {
  const item = program({ supportTypes: ['loan'] });
  const matches = api.getFundingMatches({ sector: 'agri', legalForm: 'Z/S' }, [item], { today: '2026-11-17' });
  assert.equal(matches[0].supportTypeLabels[0], 'Aizdevums — jāatmaksā');
});

test('closed programmes are hidden by default and can be requested explicitly', () => {
  const item = program({ status: 'closed', deadline: '2026-11-10' });
  assert.equal(api.getFundingMatches({ sector: 'agri', legalForm: 'Z/S' }, [item], { today: '2026-11-17' }).length, 0);
  assert.equal(api.getFundingMatches({ sector: 'agri', legalForm: 'Z/S' }, [item], { today: '2026-11-17', includeClosed: true }).length, 1);
});

test('local matching merges opportunities across multiple saved industry profiles', () => {
  const values = {
    mansdarbs_industry_profiles_v1: JSON.stringify([
      { sector: 'agri', job: 'Augkopība' },
      { sector: 'repair', job: 'Traktoru remonts' }
    ])
  };
  const storage = { getItem: key => values[key] || null };
  const agriculture = program({ id: 'agri-grant' });
  const repair = program({ id: 'repair-grant', name: 'Remonta pakalpojumu atbalsts', sectors: ['repair'] });
  const matches = api.getLocalFundingMatches(
    { programs: [agriculture, repair], sources: sourceRegistry.sources },
    { storage, today: '2026-11-17' }
  );
  assert.deepEqual(matches.map(item => item.id).sort(), ['agri-grant', 'repair-grant']);
  assert.ok(matches.every(item => item.profileMatchCount === 1));
});

test('public funding catalogue loader validates and combines programme and source registries', async () => {
  const catalog = { schemaVersion: 1, programs: [] };
  const sourceRegistry = { sources: [{ id: 'lad-support-catalogue', name: 'LAD' }] };
  const loaded = await api.loadFundingCatalog(async url => ({
    ok: true,
    json: async () => url === '/funding-programs.json' ? catalog : sourceRegistry
  }));
  assert.deepEqual(loaded.programs, catalog.programs);
  assert.deepEqual(loaded.sources, sourceRegistry.sources);
  await assert.rejects(
    api.loadFundingCatalog(async url => ({
      ok: true,
      json: async () => url === '/funding-programs.json' ? { schemaVersion: 2, programs: [] } : sourceRegistry
    })),
    /unsupported format/
  );
});



test('verified current Latvian and EU funding opportunities are present in the catalogue', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  assert.ok(catalogue.programs.some(item => item.id === 'lad-la-4-1-1-farm-competitiveness-2026'));
  assert.ok(catalogue.programs.some(item => item.id === 'nostradamus-open-call-1-2026'));
  assert.ok(catalogue.programs.every(item => item.sourceId && item.lastVerifiedAt && item.sourceUrl));
});

test('NOSTRADAMUS agricultural digital call is shown with a manual eligibility check', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  const matches = api.getFundingMatches(
    { sector: 'agri', activity: 'Augkopība' },
    catalogue,
    { today: '2026-11-17' }
  );
  const call = matches.find(item => item.id === 'nostradamus-open-call-1-2026');
  assert.ok(call);
  assert.equal(call.fitStatus, 'needs_more_info');
  assert.match(call.missing.join(' '), /atvērtā koda digitālu risinājumu/);
});

test('ALTUM start-up support is classified as a repayable loan, not a grant', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  const matches = api.getFundingMatches(
    { sector: 'repair', activity: 'Traktoru remonts', stage: 'new' },
    catalogue,
    { today: '2026-11-17' }
  );
  const loan = matches.find(item => item.id === 'altum-start-loan-2026');
  assert.ok(loan);
  assert.equal(loan.supportTypeLabels[0], 'Aizdevums — jāatmaksā');
  assert.equal(loan.status, 'ongoing');
});



test('LA 4.1.2 climate funding amount is distinct from LA 4.1.4 energy funding', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  const climate = catalogue.programs.find(item => item.id === 'lad-la-4-1-2-climate-farm-2026');
  const energy = catalogue.programs.find(item => item.id === 'lad-la-4-1-4-energy-efficiency-2026');
  assert.ok(climate);
  assert.ok(energy);
  assert.equal(climate.fundingDetails.totalPublicBudget, 12569464);
  assert.equal(energy.fundingDetails.totalPublicBudget, 14181117);
  assert.notEqual(climate.id, energy.id);
  assert.match(climate.sourceUrl, /la-412-/);
  assert.match(energy.sourceUrl, /la-414-/);
  assert.equal(climate.deadline, '2026-12-09');
  assert.equal(energy.deadline, '2026-12-09');
});

test('LA 4.1.4 is independently discoverable for an agriculture profile', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  const matches = api.getFundingMatches(
    { sector: 'agri', activity: 'Augkopība' },
    catalogue,
    { today: '2026-11-17' }
  );
  const energy = matches.find(item => item.id === 'lad-la-4-1-4-energy-efficiency-2026');
  assert.ok(energy);
  assert.equal(energy.status, 'open');
  assert.equal(energy.supportTypeLabels[0], 'Grants');
});


test('LAD programme records include source-backed eligibility checks and investment caveats', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  const competitiveness = catalogue.programs.find(item => item.id === 'lad-la-4-1-1-farm-competitiveness-2026');
  const climate = catalogue.programs.find(item => item.id === 'lad-la-4-1-2-climate-farm-2026');
  const energy = catalogue.programs.find(item => item.id === 'lad-la-4-1-4-energy-efficiency-2026');
  assert.match(competitiveness.eligibility.notes, /15 000 EUR/);
  assert.match(competitiveness.manualReviewReason, /traktoru/);
  assert.match(climate.eligibility.notes, /4 000 EUR/);
  assert.match(climate.manualReviewReason, /attiecināmo investīciju/);
  assert.match(energy.eligibility.notes, /I pielikumā/);
  assert.equal(competitiveness.sourceUrl, 'https://www.lad.gov.lv/lv/katalogs/la-411-atbalsts-ieguldijumiem-lauku-saimniecibas-konkuretspejai');
  assert.equal(climate.sourceUrl, 'https://www.lad.gov.lv/lv/katalogs/la-412-atbalsts-ieguldijumiem-seg-un-amonjaka-emisijas-samazinosajiem-pasakumiem-un-klimata-parmainu-mazinasanai-un-pielagosanas-pasakumu-istenosanai-lauku-saimniecibas');
  assert.equal(energy.sourceUrl, 'https://www.lad.gov.lv/lv/katalogs/la-414-atbalsts-ieguldijumiem-aer-izmantosanai-vai-energoefektivitates-palielinasanai');
});


test('LA 4.1.4 distinguishes eligible project costs from grant amount', () => {
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'funding-programs.json'), 'utf8'));
  const energy = catalogue.programs.find(item => item.id === 'lad-la-4-1-4-energy-efficiency-2026');
  assert.match(energy.manualReviewReason, /700 000 EUR/);
  assert.match(energy.manualReviewReason, /80%/);
  assert.match(energy.manualReviewReason, /20%/);
  assert.match(energy.manualReviewReason, /1,2 kWh\/kg/);
  assert.match(energy.fundingDetails.note, /tas nav granta apmērs/);
});
