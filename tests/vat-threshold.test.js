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
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '\`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('Unclosed function: ' + name);
}

const getSummary = new Function(extractFunction('getVatThresholdSummary') + '\nreturn getVatThresholdSummary;')();

test('VAT threshold counts only explicitly marked income in the selected calendar year', () => {
  const rows = [
    { kind: 'Ienākums', amount: 20000, date: '2026-02-01', vatThreshold: true },
    { kind: 'Ienākums', amount: 15000, date: '2026-05-01', vatThreshold: false },
    { kind: 'Izdevums', amount: 5000, date: '2026-06-01', vatThreshold: true },
    { kind: 'Ienākums', amount: 9000, date: '2025-12-31', vatThreshold: true }
  ];
  assert.deepEqual(getSummary(rows, '2026'), { total: 20000, remaining: 30000, level: 'none' });
});

test('VAT threshold issues an early reminder at 80 percent', () => {
  const result = getSummary([
    { kind: 'Ienākums', amount: 40000, date: '2026-08-01', vatThreshold: true }
  ], 2026);
  assert.deepEqual(result, { total: 40000, remaining: 10000, level: 'notice' });
});

test('VAT threshold issues a stronger warning at 90 percent and caps remaining at zero', () => {
  const result = getSummary([
    { kind: 'Ienākums', amount: 51000, date: '2026-10-01', vatThreshold: true }
  ], 2026);
  assert.deepEqual(result, { total: 51000, remaining: 0, level: 'high' });
});

test('unmarked legacy records do not silently enter the VAT threshold calculation', () => {
  const result = getSummary([
    { kind: 'Ienākums', amount: 49000, date: '2026-03-01' }
  ], 2026);
  assert.deepEqual(result, { total: 0, remaining: 50000, level: 'none' });
});
