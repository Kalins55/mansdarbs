const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const api = fs.readFileSync(path.join(root, 'functions/api/vid-assistant.js'), 'utf8');

test('VID assistant requests clear session consent before adding or sending a question', () => {
  const consent = html.indexOf("window.confirm('Pirms nosūtīšanas:");
  const addMessage = html.indexOf("chatHistory.push({role:'user',content:question})");
  const sendRequest = html.indexOf("body:JSON.stringify({messages:chatHistory,profile:profile.value,task:current,consent:true})");

  assert.notEqual(consent, -1, 'Explicit data-sharing confirmation is required');
  assert.notEqual(addMessage, -1, 'User question is added to chat history');
  assert.notEqual(sendRequest, -1, 'Client sends the consent flag');
  assert.ok(consent < addMessage, 'Consent must be requested before the question is added');
  assert.ok(addMessage < sendRequest, 'Question is added before the request is sent');
  assert.ok(html.includes("sessionStorage.getItem(consentKey)==='yes'"));
  assert.ok(html.includes("sessionStorage.setItem(consentKey,'yes')"));
  assert.match(html, /mansdarbsAiDataConsent/);
  assert.match(html, /OpenAI API/);
  assert.match(html, /turpmākajiem jautājumiem šajā pārlūka cilnē līdz tās aizvēršanai/);
  assert.match(html, /Mansdarbs sarunu savā serverī nesaglabā/);
});

test('VID assistant API rejects requests without explicit consent before processing or forwarding messages', () => {
  const guard = api.indexOf('if (body?.consent !== true)');
  const messages = api.indexOf('const allowedRoles = new Set(["user", "assistant"]);');
  const upstream = api.indexOf('fetch("https://api.openai.com/v1/responses"');

  assert.notEqual(guard, -1, 'Server-side consent guard exists');
  assert.ok(guard < messages, 'Consent is checked before processing chat messages');
  assert.ok(guard < upstream, 'Consent is checked before any upstream AI request');
});

test('VID assistant enforces the request size limit even when Content-Length is absent or inaccurate', () => {
  const rawBody = api.indexOf('rawBody = await request.text()');
  const byteLimit = api.indexOf('new TextEncoder().encode(rawBody).byteLength > 14000');
  const parseBody = api.indexOf('body = JSON.parse(rawBody)');
  const consent = api.indexOf('if (body?.consent !== true)');

  assert.notEqual(rawBody, -1, 'Request body is read as text');
  assert.notEqual(byteLimit, -1, 'Actual request bytes are checked against the limit');
  assert.notEqual(parseBody, -1, 'JSON is parsed only after the byte limit check');
  assert.ok(rawBody < byteLimit && byteLimit < parseBody && parseBody < consent,
    'Body size is enforced before parsing and consent-dependent processing');
});


test('VID assistant API returns 403 and never contacts OpenAI when consent is absent', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = {
    Response,
    URL,
    TextEncoder,
    fetch: async () => { upstreamCalls += 1; throw new Error('Unexpected upstream call'); }
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Test question' }] })
  });

  const response = await sandbox.onRequestPost({
    request,
    env: { OPENAI_API_KEY: 'test-key' }
  });

  assert.equal(response.status, 403);
  assert.equal(upstreamCalls, 0, 'The AI provider must not be contacted without consent');
});
