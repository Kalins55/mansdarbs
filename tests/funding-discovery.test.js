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
