const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extractFunction(name) {
  const start = html.indexOf('function ' + name + '(');
  assert.notEqual(start, -1, 'Missing function: ' + name);
  const brace = html.indexOf('{', start);
  let depth = 0, quote = null, escaped = false;
  for (let i = brace; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch.charCodeAt(0) === 92) escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('Unclosed function: ' + name);
}

function runComparison(values) {
  const elements = {};
  for (const [id, value] of Object.entries(values)) elements[id] = { value: String(value), checked: false };
  elements.regimeVatStatus = { value: values.regimeVatStatus || 'eligible' };
  elements.regimeMinimumIinExempt = { checked: values.exempt === true };
  elements.regimeResult = { className: 'empty', textContent: '', innerHTML: '' };
  const document = { documentElement: { lang: 'lv' }, getElementById: id => elements[id] };
  const money = value => Number(value).toFixed(2) + ' €';
  const run = new Function('document', 'money', 'progressiveIin',
    extractFunction('compareTaxRegimes') + '; return compareTaxRegimes;'
  )(document, money, amount => {
    const x = Math.max(0, amount);
    return Math.min(x, 105300) * 0.255 + Math.max(0, x - 105300) * 0.33 + Math.max(0, x - 200000) * 0.03;
  });
  run();
  return elements.regimeResult;
}

test('comparison uses 25% of turnover for MUN, not profit', () => {
  const result = runComparison({
    regimeTurnover: 20000, regimeExpenses: 0, regimeVsaoi: 5000,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.innerHTML, /5000\.00 €/);
  assert.match(result.innerHTML, /MUN 25% no apgrozījuma/);
  assert.match(result.innerHTML, /MUN nodokļu slogs ir zemāks/);
});

test('high business expenses reduce general-regime profit but not MUN tax base', () => {
  const result = runComparison({
    regimeTurnover: 20000, regimeExpenses: 17000, regimeVsaoi: 300,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.innerHTML, /vispārējā režīma nodokļu slogs ir zemāks/i);
  assert.match(result.innerHTML, /5000\.00 €/);
});

test('MUN is not recommended when VAT registration is selected', () => {
  const result = runComparison({
    regimeTurnover: 20000, regimeExpenses: 5000, regimeVsaoi: 1500,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0,
    regimeVatStatus: 'registered'
  });
  assert.match(result.innerHTML, /MUN izvēli nevar droši ieteikt/);
  assert.doesNotMatch(result.innerHTML, /Pēc ievadītajiem datiem MUN nodokļu slogs ir zemāks/);
});

test('comparison rejects VSAOI above annual profit', () => {
  const result = runComparison({
    regimeTurnover: 10000, regimeExpenses: 5000, regimeVsaoi: 6000,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.textContent, /VSAOI summa pārsniedz peļņu/);
});

test('MUN eligibility is retained at exactly €50,000 turnover', () => {
  const result = runComparison({
    regimeTurnover: 50000, regimeExpenses: 10000, regimeVsaoi: 5000,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.doesNotMatch(result.innerHTML, /MUN izvēli nevar droši ieteikt/);
});

test('MUN is not recommended above the €50,000 turnover threshold', () => {
  const result = runComparison({
    regimeTurnover: 50001, regimeExpenses: 10000, regimeVsaoi: 5000,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.innerHTML, /MUN izvēli nevar droši ieteikt/);
  assert.match(result.innerHTML, /pārsniedz 50 000/);
});

test('special VAT registration can retain MUN eligibility below the threshold', () => {
  const result = runComparison({
    regimeTurnover: 20000, regimeExpenses: 5000, regimeVsaoi: 1500,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0,
    regimeVatStatus: 'special'
  });
  assert.doesNotMatch(result.innerHTML, /MUN izvēli nevar droši ieteikt/);
  assert.match(result.innerHTML, /MUN 25% no apgrozījuma/);
});

test('minimum IIN exemption is applied only when the user confirms actual payment or another exemption', () => {
  const common = {
    regimeTurnover: 1000, regimeExpenses: 900, regimeVsaoi: 10,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  };
  const withoutExemption = runComparison(common);
  const withExemption = runComparison({ ...common, exempt: true });
  assert.match(withoutExemption.innerHTML, /Vispārējais režīms — IIN[\s\S]*?50\.00 €/);
  assert.match(withExemption.innerHTML, /Vispārējais režīms — IIN[\s\S]*?0\.00 €/);
});

function runPrefill(records, options = {}) {
  const elements = {
    regimeRecordYear: { value: String(options.year || 2026) },
    regimeRecordsStatus: { textContent: '' },
    regimeTurnover: { value: options.importedIncome ?? '', dataset: options.importedIncome !== undefined ? { synced: 'records' } : {} },
    regimeExpenses: { value: options.importedExpenses ?? '', dataset: options.importedExpenses !== undefined ? { synced: 'records' } : {} }
  };
  if (options.manualIncome !== undefined) {
    elements.regimeTurnover.value = String(options.manualIncome);
    elements.regimeTurnover.dataset.synced = 'manual';
  }
  if (options.manualExpenses !== undefined) {
    elements.regimeExpenses.value = String(options.manualExpenses);
    elements.regimeExpenses.dataset.synced = 'manual';
  }
  const document = { getElementById: id => elements[id] };
  const run = new Function('document', 'getRecords', 'money',
    extractFunction('clearRegimeRecordPrefill') + ';' + extractFunction('fillRegimeFromRecords') + '; return fillRegimeFromRecords;'
  )(document, () => records, value => Number(value).toFixed(2) + ' €');
  run();
  return elements;
}

test('comparison imports only selected-year income and expenses from local records', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: 1000, date: '2026-01-12' },
    { kind: 'Izdevums', amount: 250, date: '2026-02-02' },
    { kind: 'Ienākums', amount: 900, date: '2025-12-31' }
  ]);
  assert.equal(result.regimeTurnover.value, '1000.00');
  assert.equal(result.regimeExpenses.value, '250.00');
  assert.match(result.regimeRecordsStatus.textContent, /2 derīgi ieraksti/);
});

test('comparison prefill never overwrites manually entered values', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: 1000, date: '2026-01-12' },
    { kind: 'Izdevums', amount: 250, date: '2026-02-02' }
  ], { manualIncome: 1500 });
  assert.equal(result.regimeTurnover.value, '1500');
  assert.equal(result.regimeExpenses.value, '250.00');
  assert.match(result.regimeRecordsStatus.textContent, /Manuāli ievadītie lauki netika pārrakstīti/);
});

test('comparison prefill reports when no records exist for selected year', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: 1000, date: '2025-01-12' }
  ]);
  assert.match(result.regimeRecordsStatus.textContent, /nav atrasts neviens/);
});

test('comparison clears stale imported values when selected year has no records but preserves manual values', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: 1000, date: '2025-01-12' }
  ], { importedIncome: '1000.00', importedExpenses: '250.00', manualIncome: 1500 });
  assert.equal(result.regimeTurnover.value, '1500');
  assert.equal(result.regimeExpenses.value, '');
  assert.equal(result.regimeExpenses.dataset.synced, '');
  assert.match(result.regimeRecordsStatus.textContent, /Iepriekš no uzskaites pārņemtās vērtības notīrītas/);
});

test('comparison clears stale imported values when all selected-year records are invalid', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: -50, date: '2026-01-12' }
  ], { importedIncome: '1000.00', importedExpenses: '250.00' });
  assert.equal(result.regimeTurnover.value, '');
  assert.equal(result.regimeExpenses.value, '');
  assert.match(result.regimeRecordsStatus.textContent, /Iepriekš no uzskaites pārņemtās vērtības notīrītas/);
});

test('comparison clears stale auto-synced IIN values when source fields are blank but preserves manual values', () => {
  const elements = {
    regimeVsaoi: { value: '500', dataset: { synced: 'auto' } },
    regimeOtherIncome: { value: '2000', dataset: { synced: 'auto' } },
    regimeAllowance: { value: '6600', dataset: { synced: 'auto' } },
    regimeDeductions: { value: '300', dataset: { synced: 'manual' } },
    annualVsaoi: { value: '600' },
    otherTaxableIncome: { value: '' },
    annualAllowance: { value: '6600' },
    otherDeductions: { value: '' }
  };
  const document = { getElementById: id => elements[id] };
  const run = new Function('document', extractFunction('syncTaxRegimeInputs') + '; return syncTaxRegimeInputs;')(document);
  run();
  assert.equal(elements.regimeVsaoi.value, '600');
  assert.equal(elements.regimeVsaoi.dataset.synced, 'auto');
  assert.equal(elements.regimeOtherIncome.value, '');
  assert.equal(elements.regimeOtherIncome.dataset.synced, '');
  assert.equal(elements.regimeAllowance.value, '6600');
  assert.equal(elements.regimeAllowance.dataset.synced, 'auto');
  assert.equal(elements.regimeDeductions.value, '300');
  assert.equal(elements.regimeDeductions.dataset.synced, 'manual');
});

test('comparison reset clears the allowance sync marker so later IIN values can sync', () => {
  const ids = ['regimeTurnover', 'regimeExpenses', 'regimeVsaoi', 'regimeOtherIncome', 'regimeAllowance', 'regimeDeductions'];
  const elements = Object.fromEntries(ids.map(id => [id, { value: '123', dataset: { synced: 'manual' } }]));
  elements.regimeVatStatus = { value: 'registered' };
  elements.regimeMinimumIinExempt = { checked: true };
  elements.regimeResult = { className: '', textContent: '' };
  const document = { getElementById: id => elements[id] };
  const run = new Function('document', extractFunction('resetTaxRegimeComparison') + '; return resetTaxRegimeComparison;')(document);
  run();
  assert.equal(elements.regimeAllowance.value, '6600');
  assert.equal(elements.regimeAllowance.dataset.synced, '');
  assert.equal(elements.regimeTurnover.dataset.synced, '');
});

test('comparison warns when MUN exceeds profit after expenses', () => {
  const result = runComparison({
    regimeTurnover: 10000, regimeExpenses: 9000, regimeVsaoi: 100,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.innerHTML, /MUN var pārsniegt peļņu/);
  assert.match(result.innerHTML, /MUN 2500\.00 € pārsniedz peļņu 1000\.00 €/);
});

test('comparison warns when general-regime tax exceeds very low profit', () => {
  const result = runComparison({
    regimeTurnover: 100, regimeExpenses: 60, regimeVsaoi: 1,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.innerHTML, /vispārējā režīma nodokļu summa pārsniedz norādīto peļņu/i);
  assert.match(result.innerHTML, /50\.00 €/);
});

test('comparison does not show tax-exceeds-profit warnings when both tax totals are below profit', () => {
  const result = runComparison({
    regimeTurnover: 30000, regimeExpenses: 5000, regimeVsaoi: 5000,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.doesNotMatch(result.innerHTML, /MUN var pārsniegt peļņu/);
  assert.doesNotMatch(result.innerHTML, /nodokļu summa pārsniedz norādīto peļņu/i);
});

test('comparison import skips malformed dates, unknown record types and invalid amounts', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: 1000, date: '2026-01-12' },
    { kind: 'Ienākums', amount: 'not-a-number', date: '2026-02-02' },
    { kind: 'Izdevums', amount: 100, date: '2026-02-31' },
    { kind: 'Other', amount: 200, date: '2026-03-03' }
  ]);
  assert.equal(result.regimeTurnover.value, '1000.00');
  assert.equal(result.regimeExpenses.value, '0.00');
  assert.match(result.regimeRecordsStatus.textContent, /Izlaisti 3 nekorekti ieraksti/);
});

test('comparison import reports when all selected-year records are malformed', () => {
  const result = runPrefill([
    { kind: 'Ienākums', amount: -50, date: '2026-01-12' },
    { kind: 'Izdevums', amount: 100, date: '2026-13-01' }
  ]);
  assert.match(result.regimeRecordsStatus.textContent, /bet to datums, veids vai summa nav korekta/);
  assert.equal(result.regimeTurnover.value, '');
  assert.equal(result.regimeExpenses.value, '');
});
