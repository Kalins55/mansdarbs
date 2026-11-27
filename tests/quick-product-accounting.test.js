const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'quick-product-accounting.js'), 'utf8');

test('quick sales use the local calendar date for saving and daily totals', () => {
  const start = source.indexOf('const localDate=d=>');
  assert.notEqual(start, -1, 'Missing local date helper');
  const end = source.indexOf(';', start) + 1;
  const helper = source.slice(start, end);
  const localDate = new Function(helper + '; return localDate;')();
  const date = {
    getFullYear: () => 2026,
    getMonth: () => 10,
    getDate: () => 17
  };
  assert.equal(localDate(date), '2026-11-17');
  assert.match(source, /date:localDate\(now\)/);
  assert.match(source, /const today=localDate\(new Date\(\)\)/);
  assert.doesNotMatch(source, /toISOString\(\)\.slice\(0,10\)/);
});

test('quick sales summary checks today\'s records, not all historical records', () => {
  assert.match(source, /todaysSales\.length\s*\?\s*todaysSales\.slice/);
});

test('daily report groups sales by product and totals sold units', () => {
  assert.match(source, /const units=todaysSales\.reduce\(\(sum,s\)=>sum\+s\.qty,0\)/);
  assert.match(source, /const byProduct=new Map\(\)/);
  assert.match(source, /item\.qty\+=s\.qty;item\.total\+=s\.total/);
  assert.match(source, /Šodienas kopsavilkums/);
  assert.match(source, /Pārdotās vienības:/);
});
