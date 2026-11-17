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
  assert.match(contextEngine, /localStorage\.getItem\(['"]mansdarbs_context_profile_v1['"]\)/);
  assert.match(contextEngine, /localStorage\.setItem\(['"]mansdarbs_context_profile_v1['"]/);
  assert.match(contextEngine, /localStorage\.removeItem\(['"]mansdarbs_context_profile_v1['"]\)/);

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

test('context profile stores only the selected stage and need as its personalisation inputs', () => {
  assert.match(contextEngine, /JSON\.stringify\(\{\s*stage:\s*stageEl\.value,\s*need:\s*needEl\.value\s*\}\)/);
  assert.doesNotMatch(contextEngine, /navigator\.sendBeacon|\banalytics\b/i);
});
