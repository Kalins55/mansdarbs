const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const contextEngine = fs.readFileSync(path.join(root, 'context-engine.js'), 'utf8');
const contextualHelp = fs.readFileSync(path.join(root, 'contextual-help.js'), 'utf8');

const networkApis = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /\bsendBeacon\s*\(/
];

test('context profile remains browser-local and does not call network APIs', () => {
  assert.match(contextEngine, /const KEY = ['"]mansdarbs_context_profile_v1['"]/);
  assert.match(contextEngine, /localStorage\.getItem\(KEY\)/);
  assert.match(contextEngine, /localStorage\.setItem\(KEY, JSON\.stringify\(next\)\)/);
  assert.match(contextEngine, /localStorage\.removeItem\(KEY\)/);

  for (const api of networkApis) {
    assert.doesNotMatch(contextEngine, api, 'Context profile must not transmit user data');
  }
});

test('contextual help is local UI guidance and does not transmit form details', () => {
  for (const api of networkApis) {
    assert.doesNotMatch(contextualHelp, api, 'Contextual help must not make network requests');
  }
  assert.doesNotMatch(contextualHelp, /document\.cookie|localStorage\.(?:getItem|setItem)/);
});

test('context profile contains only stage, need and a local update timestamp', () => {
  assert.match(contextEngine, /const next = \{stage: stageEl\.value, need: needEl\.value, updatedAt: new Date\(\)\.toISOString\(\)\}/);
  assert.match(contextEngine, /JSON\.stringify\(next\)/);
});
