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

test('industry income is included in tax warnings only when marked as VAT-qualifying', () => {
  const elements = {
    taxWarning: { hidden: true, innerHTML: '' },
    date: { value: '2026-11-17' },
    amount: { value: '' },
    kind: { value: 'Ienākums' },
    vatThreshold: { checked: false }
  };
  const industry = [
    { flow: 'income', amount: 10000, date: '2026-11-10', vatThreshold: true },
    { flow: 'income', amount: 5000, date: '2026-11-11', vatThreshold: false },
    { flow: 'expense', amount: 1000, date: '2026-11-12', vatThreshold: false }
  ];
  const document = {
    documentElement: { lang: 'lv' },
    getElementById: id => elements[id]
  };
  const localStorage = { getItem: key => key === 'mansdarbs_industry_records_v1' ? JSON.stringify(industry) : null };
  const money = value => Number(value).toFixed(2) + ' €';
  const run = new Function(
    'document', 'localStorage', 'getRecords', 'money', 'editingIndex',
    extractFunction('updateIinWarning') + '; return updateIinWarning;'
  )(document, localStorage, () => [], money, null);
  run();
  assert.match(elements.taxWarning.innerHTML, /10 000\.00 €/);
  assert.doesNotMatch(elements.taxWarning.innerHTML, /15 000\.00 €/);
  assert.match(elements.taxWarning.innerHTML, /Iespējams IIN pienākums/);
});
