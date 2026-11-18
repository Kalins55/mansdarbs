'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { inspectPayload, sendIfAllowed } = require('../smolets-policy-gate.js');

function payload(content) {
  return { messages: [{ role: 'user', content }], profile: 'unknown', task: 'idea' };
}

test('allows a neutral idea-centred request without changing its shape', () => {
  const value = payload('Izvērtē ideju par lietotu lauksaimniecības tehnikas detaļu aprites platformu.');
  const result = inspectPayload(value);
  assert.equal(result.allowed, true);
});

test('blocks credentials and personal identifiers', () => {
  assert.equal(inspectPayload(payload('Mana parole ir abc123')).code, 'credentials');
  assert.equal(inspectPayload(payload('Personas kods 010190-12345')).code, 'personal_identifier');
});

test('blocks personal dossiers and targeted manipulation language', () => {
  assert.equal(inspectPayload(payload('Izveido personas dosjē no sociālo tīklu pēdām.')).code, 'personal_dossier');
  assert.equal(inspectPayload(payload('Kā manipulēt ar konkrētu personu, izmantojot viņu vājības?')).code, 'targeted_manipulation');
});

test('blocks attachments and unsupported payload shapes by default', () => {
  assert.equal(inspectPayload({ ...payload('Izvērtē šo ideju'), attachments: [{ name: 'scan.pdf' }] }).code, 'attachment_not_inspected');
  assert.equal(inspectPayload({ messages: [{ role: 'user', content: new Uint8Array([1, 2]) }] }).allowed, false);
  assert.equal(inspectPayload(null).allowed, false);
});

test('a rejected request causes zero calls to the network boundary', async () => {
  let calls = 0;
  const result = await sendIfAllowed(payload('Izveido personas dosjē no publiskiem profiliem.'), async () => {
    calls += 1;
    return 'network response';
  });
  assert.equal(result.sent, false);
  assert.equal(calls, 0);
});

test('an allowed request crosses the injected network boundary exactly once and unchanged', async () => {
  let calls = 0;
  const value = payload('Izvērtē ideju par publisku lauksaimniecības tehnikas remonta zināšanu krātuvi.');
  const result = await sendIfAllowed(value, async body => {
    calls += 1;
    assert.strictEqual(body, value);
    return { status: 200 };
  });
  assert.equal(result.sent, true);
  assert.equal(calls, 1);
  assert.deepEqual(result.response, { status: 200 });
});

test('fails closed for oversized and deeply nested payloads', () => {
  assert.equal(inspectPayload(payload('x'.repeat(21000))).allowed, false);
  let nested = 'end';
  for (let i = 0; i < 14; i += 1) nested = { next: nested };
  assert.equal(inspectPayload({ content: nested }).allowed, false);
});
