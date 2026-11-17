const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const validInvoice = {number:'R-2026-001',date:'2026-03-01',due:'2026-03-15',seller:'Pārdevējs',buyer:'Pircējs',description:'Pakalpojums',qty:1,price:100,net:100,rate:21,vat:21,total:121,currency:'EUR'};

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

function runImport(contents, initial = {}, storageOptions = {}) {
  const input = { value: 'selected.json', files: [{ name: 'backup.json' }] };
  const store = new Map(Object.entries(initial).map(([k,v]) => [k, JSON.stringify(v)]));
  let setItemCalls = 0;
  const localStorage = {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key,value) => {
      setItemCalls++;
      if ((storageOptions.failSetItemCalls || []).includes(setItemCalls)) throw new Error('quota');
      store.set(key,String(value));
    },
    removeItem: key => store.delete(key)
  };
  let confirmations = 0, alerts = [];
  class FileReaderMock {
    readAsText() { this.result = contents; this.onload(); }
  }
  const helpers = `const BACKUP_MAX_BYTES=5*1024*1024;\nconst BACKUP_DATA_KEYS=['mansdarbs_demo_records_v1','mansdarbs_industry_records_v1','mansdarbs-vsaoi-2026-q1','mansdarbs-vsaoi-2026-q2','mansdarbs-vsaoi-2026-q3','mansdarbs-vsaoi-2026-q4','mansdarbs_vsaoi_iin_manual_v1','mansdarbs_accounting_mode','mansdarbs_sia_prototype_v1','mansdarbs_demo_invoices_v1','mansdarbs_demo_invoices_zs_v1','mansdarbs_invoice_seller_v1','mansdarbs_invoice_seller_zs_v1','mansdarbs_language_v1','mansdarbs_context_profile_v1','mansdarbs_industry_profile_v1','mansdarbs_industry_profiles_v1','mansdarbs_payment_profile_v1'];
` + extractFunction('validBackupDate') + extractFunction('validBackupTimestamp') + extractFunction('validBackupText') + extractFunction('validateBackupData');
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
    'mansdarbs-vsaoi-2026-q1':{values:[100,200,300],base:780,status:'standard',activityType:'ordinary',rows:[1,2,3].map(month=>({month,profit:month*100,base:0,full:0,pension:month*10,total:month*10}))}
  }};
  const result = runImport(JSON.stringify(backup), {
    mansdarbs_demo_records_v1:[{kind:'Izdevums',amount:10,date:'2026-02-01'}],
    mansdarbs_demo_invoices_v1:[{...validInvoice}]
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

test('v2 backup validates invoice seller profile field types', () => {
  const valid = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_invoice_seller_v1:{seller:'Pārdevējs',reg:'123',address:'Rīga',bank:'LV00',email:'test@example.com'}}}));
  const invalid = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_invoice_seller_v1:{seller:123}}}));
  assert.equal(valid.confirmations, 1);
  assert.equal(invalid.confirmations, 0);
});

test('v2 backup rejects malformed nested SIA companies and transactions', () => {
  const invalidCompany = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_sia_prototype_v1:{companies:[{name:'Bez ID'}],transactions:[]}
  }}));
  const invalidTransaction = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_sia_prototype_v1:{companies:[{id:'c1',name:'Uzņēmums'}],transactions:[{kind:'income',companyId:'c1',description:'Darbs',date:'2026-03-01',net:-10,rate:21,vat:0,total:0}]}
  }}));
  assert.equal(invalidCompany.confirmations, 0);
  assert.equal(invalidTransaction.confirmations, 0);
});

test('v2 backup rejects malformed invoice data and accepts a complete invoice', () => {
  const valid = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_demo_invoices_v1:[{...validInvoice}]}}));
  const invalidAmount = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_demo_invoices_v1:[{...validInvoice,qty:-1}]}}));
  const invalidDueDate = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{mansdarbs_demo_invoices_v1:[{...validInvoice,due:'2026-02-30'}]}}));
  assert.equal(valid.confirmations, 1);
  assert.equal(invalidAmount.confirmations, 0);
  assert.equal(invalidDueDate.confirmations, 0);
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

test('v2 backup rejects invalid bookkeeping amounts and VSAOI row values', () => {
  const invalidRecord = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:-5,date:'2026-03-01'}]
  }}));
  const invalidQuarter = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    'mansdarbs-vsaoi-2026-q1':{values:[100,200,300],base:780,status:'standard',activityType:'ordinary',rows:[1,2,3].map(month=>({month,profit:'bad',base:0,full:0,pension:0,total:0}))}
  }}));
  assert.equal(invalidRecord.confirmations, 0);
  assert.equal(invalidQuarter.confirmations, 0);
});

test('v2 backup preserves existing data when a write fails but rollback succeeds', () => {
  const result = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:25,date:'2026-03-01'}],
    mansdarbs_demo_invoices_v1:[{...validInvoice,number:'R-2026-002'}]
  }}), {
    mansdarbs_demo_records_v1:[{kind:'Izdevums',amount:10,date:'2026-02-01'}],
    mansdarbs_demo_invoices_v1:[{...validInvoice,number:'R-2026-001'}]
  }, {failSetItemCalls:[2]});
  assert.equal(result.confirmations, 1);
  assert.match(result.alerts[0], /iepriekšējie dati ir atjaunoti|previous data has been restored/i);
  assert.equal(JSON.parse(result.store.get('mansdarbs_demo_records_v1'))[0].amount, 10);
  assert.equal(JSON.parse(result.store.get('mansdarbs_demo_invoices_v1'))[0].number, 'R-2026-001');
});

test('v2 backup warns when browser storage also prevents a complete rollback', () => {
  const result = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:25,date:'2026-03-01'}],
    mansdarbs_demo_invoices_v1:[{...validInvoice,number:'R-2026-002'}]
  }}), {
    mansdarbs_demo_records_v1:[{kind:'Izdevums',amount:10,date:'2026-02-01'}],
    mansdarbs_demo_invoices_v1:[{number:'R-2026-001'}]
  }, {failSetItemCalls:[2,3]});
  assert.equal(result.confirmations, 1);
  assert.match(result.alerts[0], /neļāva pilnībā atjaunot|could not fully roll back/i);
  assert.doesNotMatch(result.alerts[0], /Esošie dati nav mainīti|previous data has been restored/i);
});


test('v2 backup accepts every supported local data category with current shapes', () => {
  const timestamp = '2026-03-01T12:00:00.000Z';
  const quarter = {
    values:[100,200,300],base:780,status:'standard',activityType:'ordinary',
    rows:[1,2,3].map(month=>({month,profit:month*100,base:0,full:0,pension:month*10,total:month*10}))
  };
  const backup = {app:'Mansdarbs',version:2,data:{
    mansdarbs_demo_records_v1:[{kind:'Ienākums',amount:125,date:'2026-03-01',category:'Pakalpojums',note:'Darbs',vatThreshold:true}],
    mansdarbs_industry_records_v1:[{id:'abc123',sector:'repair',job:'Traktoru remonts',date:'2026-03-01',amount:25,flow:'income',vatThreshold:false,kind:'Remonts',data:{flow:'income',date:'2026-03-01',amount:'25',recordKind:'Remonts'},createdAt:timestamp}],
    'mansdarbs-vsaoi-2026-q1':quarter,
    'mansdarbs-vsaoi-2026-q2':quarter,
    'mansdarbs-vsaoi-2026-q3':quarter,
    'mansdarbs-vsaoi-2026-q4':quarter,
    mansdarbs_vsaoi_iin_manual_v1:'10.00',
    mansdarbs_accounting_mode:'self',
    mansdarbs_sia_prototype_v1:{
      companies:[{id:'sia-default',name:'Mans SIA',reg:'',address:'',vat:'unknown',role:'owner',createdAt:timestamp}],
      transactions:[{id:123,companyId:'sia-default',kind:'income',date:'2026-03-01',description:'Pakalpojums',net:100,rate:21,vat:21,total:121,account:'6110'}]
    },
    mansdarbs_demo_invoices_v1:[{...validInvoice,id:123,savedAt:timestamp}],
    mansdarbs_demo_invoices_zs_v1:[{...validInvoice,number:'Z-2026-001'}],
    mansdarbs_invoice_seller_v1:{seller:'Pārdevējs',reg:'123',address:'Rīga',bank:'LV00',email:'test@example.com'},
    mansdarbs_invoice_seller_zs_v1:{seller:'Z/S',reg:'456',address:'Lauki',bank:'LV01',email:'zs@example.com'},
    mansdarbs_language_v1:'lv',
    mansdarbs_context_profile_v1:{stage:'registered',need:'tax',updatedAt:timestamp},
    mansdarbs_industry_profile_v1:{sector:'repair',job:'Traktoru remonts'},
    mansdarbs_industry_profiles_v1:[{sector:'repair',job:'Traktoru remonts'}],
    mansdarbs_payment_profile_v1:{methods:['cash','bank','invoice'],updatedAt:timestamp}
  }};
  const result = runImport(JSON.stringify(backup));
  assert.equal(result.confirmations, 1);
  assert.equal(result.alerts.length, 1);
  assert.match(result.alerts[0], /veiksmīgi atjaunota|restored successfully/i);
  assert.equal(JSON.parse(result.store.get('mansdarbs_sia_prototype_v1')).transactions[0].companyId, 'sia-default');
});

test('v2 backup rejects invalid context, industry and payment profiles before writing', () => {
  const invalidContext = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_context_profile_v1:{stage:'administrator',need:'tax'}
  }}));
  const invalidIndustry = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_industry_profile_v1:{sector:'repair'}
  }}));
  const invalidPayment = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_payment_profile_v1:{methods:['cash','unknown']}
  }}));
  assert.equal(invalidContext.confirmations, 0);
  assert.equal(invalidIndustry.confirmations, 0);
  assert.equal(invalidPayment.confirmations, 0);
});

test('v2 backup rejects malformed industry records and orphaned SIA transactions', () => {
  const invalidIndustry = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_industry_records_v1:[{date:'2026-03-01',amount:25,flow:'income',data:{description:{unsafe:true}}}]
  }}));
  const orphanedSia = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_sia_prototype_v1:{companies:[],transactions:[{companyId:'missing',kind:'income',date:'2026-03-01',description:'Darbs',net:100,rate:21,vat:21,total:121}]}
  }}));
  assert.equal(invalidIndustry.confirmations, 0);
  assert.equal(orphanedSia.confirmations, 0);
});

test('v2 backup rejects inconsistent invoice totals and ordinary negative VSAOI profit', () => {
  const invalidInvoice = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    mansdarbs_demo_invoices_v1:[{...validInvoice,total:999}]
  }}));
  const invalidQuarter = runImport(JSON.stringify({app:'Mansdarbs',version:2,data:{
    'mansdarbs-vsaoi-2026-q1':{
      values:[-100,200,300],base:780,status:'standard',activityType:'ordinary',
      rows:[1,2,3].map(month=>({month,profit:month===1?-100:month*100,base:0,full:0,pension:0,total:0}))
    }
  }}));
  assert.equal(invalidInvoice.confirmations, 0);
  assert.equal(invalidQuarter.confirmations, 0);
});
