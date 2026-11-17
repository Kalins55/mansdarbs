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
      else if (ch === String.fromCharCode(92)) escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('Unclosed function: ' + name);
}

test('editing a record restores its date before recalculating tax warnings', () => {
  const values = {
    kind: { value: '' },
    vatThreshold: { checked: false },
    vatThresholdField: { hidden: false },
    date: { value: '' },
    amount: { value: '', scrollIntoView() {} },
    note: { value: '' },
    saveRecordButton: { textContent: '' },
    cancelEditButton: { classList: { remove() {} } }
  };
  const record = {
    kind: 'Ienākums', amount: 125.5, date: '2026-03-14',
    note: 'Remonts', vatThreshold: true, category: 'Pakalpojums'
  };
  let warningDate = null;
  const document = { getElementById: id => values[id] };
  const run = new Function(
    'document', 'getRecords', 'updateRecordCategories', 'updateIinWarning',
    extractFunction('editRecord') + '; return editRecord;'
  )(
    document,
    () => [record],
    () => {},
    () => { warningDate = values.date.value; }
  );
  run(0);
  assert.equal(warningDate, '2026-03-14');
  assert.equal(values.amount.value, '125.50');
  assert.equal(values.vatThreshold.checked, true);
  assert.equal(values.vatThresholdField.hidden, false);
  assert.equal(values.saveRecordButton.textContent, 'Saglabāt izmaiņas');
});
