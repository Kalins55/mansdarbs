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

test('MUN is not recommended at or above the €50,000 turnover threshold', () => {
  const result = runComparison({
    regimeTurnover: 50000, regimeExpenses: 10000, regimeVsaoi: 5000,
    regimeOtherIncome: 0, regimeAllowance: 6600, regimeDeductions: 0
  });
  assert.match(result.innerHTML, /MUN izvēli nevar droši ieteikt/);
  assert.match(result.innerHTML, /sasniedz vai pārsniedz 50 000/);
});
