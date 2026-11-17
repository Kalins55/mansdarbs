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

test('industry records feed IIN and VAT warnings, with VAT opt-in per transaction', () => {
  const industry = [
    { flow: 'income', amount: 10000, date: '2026-11-10', vatThreshold: true },
    { flow: 'income', amount: 5000, date: '2026-11-11', vatThreshold: false },
    { flow: 'expense', amount: 1000, date: '2026-11-12', vatThreshold: false }
  ];
  const localStorage = {
    getItem: key => key === 'mansdarbs_industry_records_v1' ? JSON.stringify(industry) : null
  };
  const records = new Function('localStorage', extractFunction('getIndustryTaxRecords') + '; return getIndustryTaxRecords;')(localStorage)();
  assert.equal(records.length, 3);
  assert.equal(records[0].kind, 'Ienākums');
  assert.equal(records[0].vatThreshold, true);
  assert.equal(records[1].vatThreshold, false);
  assert.equal(records[2].kind, 'Izdevums');

  const summary = new Function(extractFunction('getVatThresholdSummary') + '; return getVatThresholdSummary;')()(records, 2026);
  assert.equal(summary.total, 10000);
  assert.equal(summary.remaining, 40000);
  assert.match(html, /const industryItems=getIndustryTaxRecords\(\);/);
  assert.match(html, /baseItems\.concat\(industryItems\)/);
});
