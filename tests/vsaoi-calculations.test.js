const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extractFunction(name) {
  const start = html.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Missing function: ' + name);
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
    else if (ch === '}') {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error('Unclosed function: ' + name);
}

function createHarness() {
  const elements = {
    profit1: { value: '0' }, profit2: { value: '0' }, profit3: { value: '0' },
    contributionBase: { value: '780' }, contributionStatus: { value: 'standard' },
    vsaoiActivityType: { value: 'ordinary' }, vsaoiQuarter: { value: '1' },
    vsaoiResult: { innerHTML: '' }, annualProfit: { value: '' }, annualVsaoi: { value: '' }
  };
  const storage = new Map();
  const alerts = [];
  const document = {
    documentElement: { lang: 'lv' },
    getElementById(id) {
      if (!elements[id]) throw new Error('Unexpected element: ' + id);
      return elements[id];
    }
  };
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, value)
  };
  const money = value => Number(value).toFixed(2) + ' €';
  const uiText = lv => lv;
  const alert = message => alerts.push(message);
  const source = [
    extractFunction('vsaoiQuarterKey'),
    extractFunction('syncIinFromVsaoi'),
    extractFunction('calculateVsaoi')
  ].join('\n') + '\nreturn calculateVsaoi;';
  const calculate = new Function('document', 'localStorage', 'money', 'uiText', 'alert', source)(
    document, localStorage, money, uiText, alert
  );
  function runQuarter(quarter, values, activity = 'ordinary', status = 'standard') {
    elements.vsaoiQuarter.value = String(quarter);
    elements.vsaoiActivityType.value = activity;
    elements.contributionStatus.value = status;
    values.forEach((value, i) => { elements['profit' + (i + 1)].value = String(value); });
    calculate();
    const saved = storage.get('mansdarbs-vsaoi-2026-q' + quarter);
    return saved ? JSON.parse(saved) : null;
  }
  return { elements, storage, alerts, runQuarter };
}

test('ordinary activity: monthly 10% and full VSAOI are rounded to cents', () => {
  const h = createHarness();
  const saved = h.runQuarter(1, [500, 1000, 0]);
  assert.deepEqual(saved.rows.map(row => row.total), [50, 264.35, 0]);
  assert.equal(h.elements.annualProfit.value, '1500.00');
  assert.equal(h.elements.annualVsaoi.value, '314.35');
});

test('agricultural annual mode: VID example with three months over €780', () => {
  const h = createHarness();
  const saved = h.runQuarter(3, [800, 790, 785], 'annual_special');
  assert.equal(saved.rows.reduce((sum, row) => sum + row.total, 0), 727.05);
  assert.equal(h.elements.annualProfit.value, '2375.00');
  assert.equal(h.elements.annualVsaoi.value, '730.55');
  assert.match(h.elements.vsaoiResult.innerHTML, /35\.00 €/);
  assert.match(h.elements.vsaoiResult.innerHTML, /3\.50 €/);
});

test('agricultural annual mode includes loss-making months in the yearly total', () => {
  const h = createHarness();
  h.runQuarter(1, [800, 450, 900], 'annual_special');
  h.runQuarter(2, [-700, 1500, 900], 'annual_special');
  h.runQuarter(3, [2100, 4000, -200], 'annual_special');
  assert.equal(h.elements.annualProfit.value, '9750.00');
  assert.equal(h.elements.annualVsaoi.value, '1961.10');
  assert.match(h.elements.vsaoiResult.innerHTML, /5070\.00 €/);
  assert.match(h.elements.vsaoiResult.innerHTML, /507\.00 €/);
});

test('pension-age rate uses 29.36%', () => {
  const h = createHarness();
  const saved = h.runQuarter(1, [1000, 0, 0], 'ordinary', 'pensioner');
  assert.equal(saved.rows[0].full, 229.01);
  assert.equal(saved.rows[0].total, 251.01);
});

test('ordinary mode rejects losses while annual special mode accepts them', () => {
  const h = createHarness();
  assert.equal(h.runQuarter(1, [-100, 0, 0], 'ordinary'), null);
  assert.equal(h.alerts.length, 1);
  const saved = h.runQuarter(1, [-100, 0, 0], 'annual_special');
  assert.equal(saved.rows[0].profit, -100);
  assert.equal(h.elements.annualProfit.value, '-100.00');
});
