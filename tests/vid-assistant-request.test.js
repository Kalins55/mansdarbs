const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'functions/api/vid-assistant.js'),
  'utf8'
);
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');

test('VID assistant rejects oversized bodies even without Content-Length', async () => {
  const { onRequestPost } = await import(moduleUrl);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(15000) }] })
  });

  const response = await onRequestPost({ request, env: {} });
  assert.equal(response.status, 413);
});

test('VID assistant rejects malformed JSON with a controlled response', async () => {
  const { onRequestPost } = await import(moduleUrl);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid'
  });

  const response = await onRequestPost({ request, env: {} });
  assert.equal(response.status, 400);
});

test('VID assistant rejects cross-origin requests before processing the body', async () => {
  const { onRequestPost } = await import(moduleUrl);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { Origin: 'https://attacker.example' },
    body: '{}'
  });

  const response = await onRequestPost({ request, env: {} });
  assert.equal(response.status, 403);
});

test('VID assistant returns the setup message when the API key is absent', async () => {
  const { onRequestPost } = await import(moduleUrl);
  const request = new Request('https://mansdarbs.eu/api/vid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Palīdzi ar EDS.' }] })
  });

  const response = await onRequestPost({ request, env: {} });
  assert.equal(response.status, 503);
});
