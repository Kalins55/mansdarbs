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

function runImport(contents) {
  const input = { value: 'selected.json', files: [{ name: 'backup.json' }] };
  let saved = null, confirmations = 0, alerts = [];
  class FileReaderMock {
    readAsText() { this.result = contents; this.onload(); }
  }
  const fn = new Function(
    'FileReader', 'uiText', 'saveRecords', 'cancelEdit', 'renderRecords',
    'confirm', 'alert', 'document', extractFunction('importRecordsBackup') +
      '; return importRecordsBackup;'
  )(
    FileReaderMock,
    (lv) => lv,
    records => { saved = records; return true; },
    () => {},
    () => {},
    () => { confirmations++; return true; },
    message => alerts.push(message),
    { }
  );
  fn({ target: input });
  return { saved, confirmations, alerts, input };
}

test('backup restore rejects impossible calendar dates without changing records', () => {
  const result = runImport(JSON.stringify({
    app: 'Mansdarbs', version: 1,
    records: [{ kind: 'Ienākums', amount: 100, date: '2026-02-30' }]
  }));
  assert.equal(result.saved, null);
  assert.equal(result.confirmations, 0);
  assert.equal(result.alerts.length, 1);
  assert.equal(result.input.value, '');
});

test('backup restore rejects unknown backup formats before confirmation', () => {
  const result = runImport(JSON.stringify({
    app: 'OtherApp', version: 1,
    records: [{ kind: 'Ienākums', amount: 100, date: '2026-02-28' }]
  }));
  assert.equal(result.saved, null);
  assert.equal(result.confirmations, 0);
});

test('backup restore accepts a valid Mansdarbs backup and normalizes records', () => {
  const result = runImport(JSON.stringify({
    app: 'Mansdarbs', version: 1,
    records: [{
      kind: 'Ienākums', amount: 125.555, date: '2026-02-28',
      category: 'Pakalpojums', note: 'Darbs', vatThreshold: true
    }]
  }));
  assert.equal(result.confirmations, 1);
  assert.deepEqual(result.saved, [{
    kind: 'Ienākums', amount: 125.56, date: '2026-02-28',
    category: 'Pakalpojums', note: 'Darbs', vatThreshold: true
  }]);
  assert.equal(result.input.value, '');
});
