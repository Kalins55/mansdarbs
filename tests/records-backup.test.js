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

function runImport(contents, initial = {}) {
  const input = { value: 'selected.json', files: [{ name: 'backup.json' }] };
  const store = new Map(Object.entries(initial).map(([k,v]) => [k, JSON.stringify(v)]));
  const localStorage = {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key,value) => store.set(key,String(value)),
    removeItem: key => store.delete(key)
  };
  let confirmations = 0, alerts = [];
  class FileReaderMock {
    readAsText() { this.result = contents; this.onload(); }
  }
  const helpers = `const BACKUP_MAX_BYTES=5*1024*1024;
` + extractFunction('validBackupDate') + extractFunction('validateBackupData');
  const fn = new Function(
    'FileReader','uiText','saveRecords','cancelEdit','renderRecords','renderInvoices',
    'siaRender','loadVsaoiQuarter','syncIinFromVsaoi','confirm','alert','document','localStorage',
    helpers + extractFunction('importRecordsBackup') + '; return importRecordsBackup;'
  )(
    FileReaderMock, lv => lv,
    records => { localStorage.setItem('mansdarbs_demo_records_v1', JSON.stringify(records)); return true; },
    () => {}, () => {}, () => {}, () => {}, () => {}, () => {},
    () => { confirmations++; return true; }, message => alerts.push(message), {}, localStorage
  );
  fn({ target: input });
  return { store, confirmations, alerts, input };
}

test('legacy v1 backup rejects impossible calendar dates without changing records', () => {
  const result = runImport(JSON.stringify({app:'Mansdarbs',version:1,records:[{kind:'Ienākums',amount:100,date:'2026-02-30'}]}), {mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:9,date:'2026-02-01'}]});
  assert.equal(result.confirmations, 0);
  assert.match(result.alerts[0], /derīga|valid/i);
  assert.equal(JSON.parse(result.store.get('mansdarbs_demo_records_v1'))[0].amount, 9);
});

test('legacy v1 backup remains importable and normalizes records', () => {
  const result = runImport(JSON.stringify({app:'Mansdarbs',version:1,records:[{kind:'Ienākums',amount:125.555,date:'2026-02-28',category:'Pakalpojums',note:'Darbs',vatThreshold:true}]}));
  assert.equal(result.confirmations, 1);
  assert.deepEqual(JSON.parse(result.store.get('mansdarbs_demo_records_v1')), [{kind:'Ienākums',amount:125.56,date:'2026-02-28',category:'Pakalpojums',note:'Darbs',vatThreshold:true}]);
});

test('v2 backup restores included categories and preserves categories absent from file', () => {
  const backup = {app:'Mansdarbs',version:2,data:{
    mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:25,date:'2026-03-01'}],
    'mansdarbs-vsaoi-2026-q1':{values:[100,200,300],base:780,status:'standard',activityType:'ordinary',rows:[{month:1},{month:2},{month:3}]}
  }};
  const result = runImport(JSON.stringify(backup), {
    mansdarbs_demo_records_v1:[{kind:'Izdevums',amount:10,date:'2026-02-01'}],
    mansdarbs_demo_invoices_v1:[{number:'R-2026-001'}]
  });
  assert.equal(result.confirmations, 1);
  assert.equal(JSON.parse(result.store.get('mansdarbs_demo_records_v1'))[0].amount, 25);
  assert.equal(JSON.parse(result.store.get('mansdarbs-vsaoi-2026-q1')).base, 780);
  assert.equal(JSON.parse(result.store.get('mansdarbs_demo_invoices_v1'))[0].number, 'R-2026-001');
});

test('v2 backup rejects unknown keys before confirmation and leaves data unchanged', () => {
  const result = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{unknown_secret:'x'}}), {mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:9,date:'2026-02-01'}]});
  assert.equal(result.confirmations, 0);
  assert.equal(JSON.parse(result.store.get('mansdarbs_demo_records_v1'))[0].amount, 9);
});

test('v2 backup rejects invalid dates and malformed dataset shapes', () => {
  const invalidDate = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:9,date:'2026-02-30'}]}}));
  const invalidShape = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_sia_prototype_v1:{companies:[],transactions:{}}}}));
  assert.equal(invalidDate.confirmations, 0);
  assert.equal(invalidShape.confirmations, 0);
});

test('v2 backup rejects oversized files before parsing or confirmation', () => {
  const result = runImport(' '.repeat(5*1024*1024+1));
  assert.equal(result.confirmations, 0);
});
