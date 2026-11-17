const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'industry-modules.js'), 'utf8');

test('industry transaction date uses local calendar fields, not UTC date', () => {
  const start = source.indexOf('function localDateInputValue(');
  assert.notEqual(start, -1, 'Missing local date helper');
  const end = source.indexOf('\n}', start) + 2;
  const fn = source.slice(start, end);
  const localDate = new Function(fn + '; return localDateInputValue;')();
  const date = {
    getFullYear: () => 2026,
    getMonth: () => 10,
    getDate: () => 17
  };
  assert.equal(localDate(date), '2026-11-17');
  assert.match(source, /value="'\+localDateInputValue\(\)\+'"/);
  assert.doesNotMatch(source, /new Date\(\)\.toISOString\(\)\.slice\(0,10\)/);
});
