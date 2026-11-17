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
    if (ch === "'" || ch === '"' || ch === '\`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('Unclosed function: ' + name);
}

function runIin(values) {
  const elements = {
    annualProfit: { value: String(values.profit ?? 0) },
    annualVsaoi: { value: String(values.vsaoi ?? 0) },
    otherTaxableIncome: { value: String(values.other ?? 0) },
    annualAllowance: { value: String(values.allowance ?? 6600) },
    otherDeductions: { value: String(values.deductions ?? 0) },
    minimumIinExempt: { checked: values.exempt === true },
    iinResult: { innerHTML: '' }
  };
  const alerts = [];
  const document = {
    documentElement: { lang: 'lv' },
    getElementById: id => elements[id]
  };
  const money = value => Number(value).toFixed(2) + ' €';
  const uiText = lv => lv;
  const alert = message => alerts.push(message);
  const run = new Function('document', 'money', 'uiText', 'alert',
    extractFunction('progressiveIin') + '\n' +
    extractFunction('calculateIin') + '\nreturn calculateIin;'
  )(document, money, uiText, alert);
  run();
  return { elements, alerts };
}

test('additional 3% IIN is calculated before the annual allowance and other reliefs', () => {
  const result = runIin({
    profit: 10000, vsaoi: 1000, other: 195000,
    allowance: 6600, deductions: 1000, exempt: true
  });
  assert.equal(result.alerts.length, 0);
  assert.match(result.elements.iinResult.innerHTML, /3 120\.00 €|3120\.00 €/);
  assert.match(result.elements.iinResult.innerHTML, /57 064\.50 €|57064\.50 €/);
});

test('additional 3% IIN does not start when the separate annual income base is exactly €200,000', () => {
  const result = runIin({
    profit: 10000, vsaoi: 1000, other: 190000,
    allowance: 6600, deductions: 1000, exempt: true
  });
  assert.equal(result.alerts.length, 0);
  assert.match(result.elements.iinResult.innerHTML, /2 970\.00 €|2970\.00 €/);
  assert.match(result.elements.iinResult.innerHTML, /55 264\.50 €|55264\.50 €/);
});


test('negative annual business profit does not block IIN estimate or reduce other income', () => {
  const result = runIin({
    profit: -1000, vsaoi: 0, other: 50000,
    allowance: 6600, deductions: 0, exempt: true
  });
  assert.equal(result.alerts.length, 0);
  assert.match(result.elements.iinResult.innerHTML, /Saimnieciskās darbības ienākuma daļa IIN bāzē<\/span><strong class="amount">0\.00 €/);
  assert.match(result.elements.iinResult.innerHTML, /peļņa ir negatīva/);
});
