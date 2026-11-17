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
  assert.match(html, /OpenAI API drošības uzraudzības žurnālos pieprasījuma saturs pēc noklusējuma var tikt glabāts līdz 30 dienām/);
  assert.match(html, /API dati netiek izmantoti modeļu apmācībai/);
  assert.match(html, /developers\\.openai\\.com\\/api\\/docs\\/guides\\/your-data/);
  assert.match(html, /OpenAI API/);
  assert.match(html, /turpmākajiem jautājumiem šajā pārlūka cilnē līdz tās aizvēršanai/);
  assert.match(html, /Mansdarbs sarunu savā serverī nesaglabā/);
});

test('VID assistant API rejects requests without explicit consent before processing or forwarding messages', () => {
  const guard = api.indexOf('if (body.consent !== true)');
  const messages = api.indexOf('const allowedRoles = new Set(["user", "assistant"]);');
  const upstream = api.indexOf('fetch("https://api.openai.com/v1/responses"');

  assert.notEqual(guard, -1, 'Server-side consent guard exists');
  assert.ok(guard < messages, 'Consent is checked before processing chat messages');
  assert.ok(guard < upstream, 'Consent is checked before any upstream AI request');
});

test('VID assistant enforces the request size limit while streaming the body', () => {
  const reader = api.indexOf('async function readLimitedRequestBody(request)');
  const byteLimit = api.indexOf('totalBytes > MAX_REQUEST_BYTES');
  const parseBody = api.indexOf('body = JSON.parse(rawBody)');
  const consent = api.indexOf('if (body.consent !== true)');

  assert.notEqual(reader, -1, 'Request body uses a bounded stream reader');
  assert.notEqual(byteLimit, -1, 'Cumulative bytes are checked as chunks arrive');
  assert.notEqual(parseBody, -1, 'JSON is parsed only after the bounded read');
  assert.ok(reader < byteLimit && byteLimit < parseBody && parseBody < consent,
    'Body size is enforced before parsing and consent-dependent processing');
  assert.match(api, /parsedOrigin\.origin !== new URL\(request\.url\)\.origin \|\| origin !== parsedOrigin\.origin/,
    'Origin validation requires the exact canonical same-origin value');
});

test('VID assistant stops reading oversized streamed requests and returns 413', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  let streamCancelled = false;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = {
    Response,
    URL,
    TextEncoder,
    TextDecoder,
    fetch: async () => { upstreamCalls += 1; throw new Error('Unexpected upstream call'); }
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('a'.repeat(8000)));
      controller.enqueue(new TextEncoder().encode('b'.repeat(7001)));
    },
    cancel() { streamCancelled = true; }
  });
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'application/json' },
    body: stream,
    duplex: 'half'
  });

  const response = await sandbox.onRequestPost({
    request,
    env: { OPENAI_API_KEY: 'test-key' }
  });

  assert.equal(response.status, 413);
  assert.equal(streamCancelled, true, 'The request stream is cancelled immediately after crossing the limit');
  assert.equal(upstreamCalls, 0, 'Oversized requests must never reach the AI provider');
});


test('VID assistant rejects a different scheme on the same host as a cross-origin request', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = { Response, URL, TextEncoder, TextDecoder, fetch: async () => { upstreamCalls += 1; } };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'http://mansdarbs.eu' },
    body: '{}'
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });

  assert.equal(response.status, 403);
  assert.equal(upstreamCalls, 0);
});

test('VID assistant rejects requests without an Origin header before reading the body or contacting OpenAI', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = {
    Response, URL, TextEncoder, TextDecoder,
    fetch: async () => { upstreamCalls += 1; }
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    body: '{}'
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });

  assert.equal(response.status, 403);
  assert.equal(upstreamCalls, 0);
});

test('VID assistant rejects non-canonical Origin values containing a path', async () => {
  const vm = require('node:vm');
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = { Response, URL, TextEncoder, TextDecoder, fetch: async () => { throw new Error('Unexpected upstream call'); } };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu/other-path' },
    body: '{}'
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });

  assert.equal(response.status, 403);
});

test('VID assistant rejects non-JSON content types before reading the request body', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = { Response, URL, TextEncoder, TextDecoder, fetch: async () => { upstreamCalls += 1; } };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'text/plain' },
    body: '{"consent":true}'
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });

  assert.equal(response.status, 415);
  assert.equal(upstreamCalls, 0);
});

test('VID assistant rejects JSON values that are not request objects', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = { Response, URL, TextEncoder, TextDecoder, fetch: async () => { upstreamCalls += 1; } };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'application/json' },
    body: '[]'
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });

  assert.equal(response.status, 400);
  assert.equal(upstreamCalls, 0);
});

test('VID assistant forwards only consented requests and returns filtered official citations', async () => {
  const vm = require('node:vm');
  let upstreamCalls = 0;
  let upstreamPayload;
  let upstreamOptions;
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = {
    Response, URL, TextEncoder, TextDecoder, AbortSignal,
    fetch: async (url, options) => {
      upstreamCalls += 1;
      assert.equal(url, 'https://api.openai.com/v1/responses');
      upstreamOptions = options;
      upstreamPayload = JSON.parse(options.body);
      return new Response(JSON.stringify({
        output: [{
          type: 'message',
          content: [
            { type: 'output_text', text: 'Pārbaudi VID informāciju.' },
            { type: 'url_citation', annotations: [
              { type: 'url_citation', url: 'https://vid.gov.lv/lv', title: 'VID' },
              { type: 'url_citation', url: 'https://example.com/fake', title: 'Fake' }
            ]}
          ]
        }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consent: true,
      profile: 'general',
      task: 'check',
      messages: [{ role: 'user', content: 'Kur pārbaudīt?' }]
    })
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(upstreamCalls, 1);
  assert.equal(upstreamPayload.store, false, 'Conversation storage must remain disabled');
  assert.ok(upstreamOptions.signal instanceof AbortSignal, 'The upstream request has a bounded timeout signal');
  assert.equal(upstreamPayload.max_output_tokens, 900);
  assert.equal(result.answer, 'Pārbaudi VID informāciju.');
  assert.deepEqual(result.sources.map(source => source.url), ['https://vid.gov.lv/lv']);
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
    TextDecoder,
    fetch: async () => { upstreamCalls += 1; throw new Error('Unexpected upstream call'); }
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://mansdarbs.eu' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Test question' }] })
  });

  const response = await sandbox.onRequestPost({
    request,
    env: { OPENAI_API_KEY: 'test-key' }
  });

  assert.equal(response.status, 403);
  assert.equal(upstreamCalls, 0, 'The AI provider must not be contacted without consent');
});


test('VID assistant returns a controlled 502 when the provider response has an invalid output shape', async () => {
  const vm = require('node:vm');
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = {
    Response, URL, TextEncoder, TextDecoder, AbortSignal,
    fetch: async () => new Response(JSON.stringify({ output: { unexpected: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consent: true,
      messages: [{ role: 'user', content: 'Pārbaudes jautājums' }]
    })
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'Saņēmu nesaprotamu atbildi. Mēģini vēlreiz.' });
});

test('VID assistant ignores malformed citation annotations without losing the answer', async () => {
  const vm = require('node:vm');
  const executable = api.replace(
    'export async function onRequestPost',
    'async function onRequestPost'
  );
  const sandbox = {
    Response, URL, TextEncoder, TextDecoder, AbortSignal,
    fetch: async () => new Response(JSON.stringify({
      output: [{
        type: 'message',
        content: [
          { type: 'output_text', text: 'Atbilde ir pieejama.' , annotations: {} },
          null
        ]
      }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  };
  vm.runInNewContext(executable + '\nthis.onRequestPost = onRequestPost;', sandbox);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://mansdarbs.eu', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consent: true,
      messages: [{ role: 'user', content: 'Pārbaudes jautājums' }]
    })
  });

  const response = await sandbox.onRequestPost({ request, env: { OPENAI_API_KEY: 'test-key' } });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.answer, 'Atbilde ir pieejama.');
  assert.deepEqual(result.sources, []);
});


test('VID guide moves focus to the updated step after using Back', () => {
  const html = read('index.html');
  assert.match(html, /mvaBack'\\)\\.addEventListener\\('click',function\\(\\)\\{if\\(index>0\\)\\{index--;render\\(\\);root\\.querySelector\\('#mvaStepTitle'\\)\\.focus\\(\\);\\}\\}\\)/);
});

test('VID assistant marks the chat log busy while an answer is loading', () => {
  const html = read('index.html');
  assert.match(html, /chatLog\\.setAttribute\\('aria-busy','true'\\)/);
  assert.match(html, /chatLog\\.setAttribute\\('aria-busy','false'\\)/);
});
