const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const api = fs.readFileSync(path.join(root, 'functions/api/vid-assistant.js'), 'utf8');

function loadHandler(fetchImpl = async () => { throw new Error('Unexpected upstream request'); }) {
  const executable = api.replace('export async function onRequestPost', 'async function onRequestPost');
  const sandbox = { Response, URL, TextEncoder, TextDecoder, AbortSignal, fetch: fetchImpl };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  return sandbox.onRequestPost;
}

function request(body, extraHeaders = {}) {
  return new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: {
      Origin: 'https://mansdarbs.eu',
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body
  });
}

test('VID assistant asks for explicit data-sharing consent before sending a question', () => {
  const consent = html.indexOf("var consentMessage=document.documentElement.lang==='en'");
  const addMessage = html.indexOf("chatHistory.push({role:'user',content:question})", consent);
  const sendRequest = html.indexOf("consent:true", consent);
  assert.notEqual(consent, -1);
  assert.ok(html.indexOf('window.confirm(consentMessage)', consent) > consent);
  assert.ok(addMessage > consent);
  assert.ok(sendRequest > addMessage);
  assert.ok(html.includes("sessionStorage.getItem(consentKey)==='yes'"));
  assert.ok(html.includes("document.documentElement.lang==='en'"));
  assert.ok(html.includes("Before sending: your question, recent chat messages"));
  assert.ok(html.includes("Pirms nosūtīšanas: tavs jautājums, pēdējās sarunas ziņas"));
});

test('VID assistant API validates same-origin JSON and server-side consent before upstream processing', () => {
  const origin = api.indexOf('if (!origin) return json');
  const contentType = api.indexOf('contentType !== "application/json"');
  const limitedRead = api.indexOf('rawBody = await readLimitedRequestBody(request)');
  const consent = api.indexOf('if (body.consent !== true)');
  const messages = api.indexOf('const allowedRoles = new Set');
  const upstream = api.indexOf('fetch("https://api.openai.com/v1/responses"');
  assert.ok(origin >= 0 && contentType > origin);
  assert.ok(limitedRead > contentType && consent > limitedRead);
  assert.ok(messages > consent && upstream > messages);
  assert.match(api, /totalBytes > MAX_REQUEST_BYTES/);
  assert.match(api, /AbortSignal\.timeout\(25000\)/);
  assert.match(api, /store: false/);
});

test('VID assistant rejects missing consent without contacting OpenAI', async () => {
  let calls = 0;
  const handler = loadHandler(async () => { calls++; });
  const response = await handler({
    request: request(JSON.stringify({ messages: [{ role: 'user', content: 'Sveiki' }] })),
    env: { OPENAI_API_KEY: 'test-key' }
  });
  assert.equal(response.status, 403);
  assert.equal(calls, 0);
});

test('VID assistant cancels oversized streamed requests before contacting OpenAI', async () => {
  let calls = 0;
  let cancelled = false;
  const handler = loadHandler(async () => { calls++; });
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('a'.repeat(8000)));
      controller.enqueue(new TextEncoder().encode('b'.repeat(7001)));
    },
    cancel() { cancelled = true; }
  });
  const req = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'application/json' },
    body: stream,
    duplex: 'half'
  });
  const response = await handler({ request: req, env: { OPENAI_API_KEY: 'test-key' } });
  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.equal(calls, 0);
});

test('VID assistant rejects missing or non-canonical Origin and wrong content type', async () => {
  let calls = 0;
  const handler = loadHandler(async () => { calls++; });
  const missing = new Request('https://mansdarbs.eu/api/vid-assistant', { method: 'POST', body: '{}' });
  const noOrigin = await handler({ request: missing, env: { OPENAI_API_KEY: 'test-key' } });
  assert.equal(noOrigin.status, 403);
  const wrongType = await handler({
    request: request('{}', { 'Content-Type': 'text/plain' }),
    env: { OPENAI_API_KEY: 'test-key' }
  });
  assert.equal(wrongType.status, 415);
  const nonCanonical = await handler({
    request: request('{}', { Origin: 'https://mansdarbs.eu/path' }),
    env: { OPENAI_API_KEY: 'test-key' }
  });
  assert.equal(nonCanonical.status, 403);
  assert.equal(calls, 0);
});

test('VID assistant returns only HTTPS citations from approved official domains', async () => {
  let upstreamRequest;
  const handler = loadHandler(async (url, options) => {
    upstreamRequest = { url, options };
    return new Response(JSON.stringify({
      output: [{
        type: 'message',
        content: [{
          type: 'output_text',
          text: 'Pārbaudi EDS paziņojumu.',
          annotations: [
            { type: 'url_citation', url: 'https://vid.gov.lv/lv', title: 'VID' },
            { type: 'url_citation', url: 'https://sub.vsaa.gov.lv/info', title: 'VSAA' },
            { type: 'url_citation', url: 'https://vid.gov.lv.attacker.example/fake', title: 'Fake' },
            { type: 'url_citation', url: 'http://vid.gov.lv/insecure', title: 'Insecure' }
          ]
        }]
      }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  const response = await handler({
    request: request(JSON.stringify({
      consent: true,
      profile: 'general',
      task: 'quarterly',
      messages: [{ role: 'user', content: 'Kur EDS redzēt paziņojumu?' }]
    })),
    env: { OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-6-luna' }
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.answer, 'Pārbaudi EDS paziņojumu.');
  assert.deepEqual(data.sources.map(source => source.url), [
    'https://vid.gov.lv/lv',
    'https://sub.vsaa.gov.lv/info'
  ]);
  assert.equal(upstreamRequest.url, 'https://api.openai.com/v1/responses');
  const payload = JSON.parse(upstreamRequest.options.body);
  assert.equal(payload.store, false);
  assert.equal(payload.model, 'gpt-6-luna');
  assert.equal(upstreamRequest.options.signal.aborted, false);
});

test('VID assistant rejects malformed JSON and non-object payloads without calling OpenAI', async () => {
  let calls = 0;
  const handler = loadHandler(async () => { calls++; });
  const malformed = await handler({
    request: request('{invalid json'),
    env: { OPENAI_API_KEY: 'test-key' }
  });
  const arrayPayload = await handler({
    request: request('[]'),
    env: { OPENAI_API_KEY: 'test-key' }
  });
  assert.equal(malformed.status, 400);
  assert.equal(arrayPayload.status, 400);
  assert.equal(calls, 0);
});

test('VID assistant does not expose provider errors or secrets to the browser', async () => {
  const handler = loadHandler(async () => new Response(
    JSON.stringify({ error: { message: 'private provider diagnostic' } }),
    { status: 401 }
  ));
  const response = await handler({
    request: request(JSON.stringify({
      consent: true,
      messages: [{ role: 'user', content: 'Sveiki' }]
    })),
    env: { OPENAI_API_KEY: 'secret-test-key' }
  });
  const body = await response.text();
  assert.equal(response.status, 502);
  assert.ok(!body.includes('private provider diagnostic'));
  assert.ok(!body.includes('secret-test-key'));
});

test('VID assistant returns a safe unavailable response when the API key is missing', async () => {
  let calls = 0;
  const handler = loadHandler(async () => { calls++; });
  const response = await handler({
    request: request(JSON.stringify({
      consent: true,
      messages: [{ role: 'user', content: 'Sveiki' }]
    })),
    env: {}
  });
  assert.equal(response.status, 503);
  assert.equal(calls, 0);
});
