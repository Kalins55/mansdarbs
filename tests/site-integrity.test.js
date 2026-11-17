const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function checkLocalScripts(html, baseDirectory) {
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(match => match[1]);
  for (const source of sources) {
    if (/^(?:[a-z]+:)?\/\//i.test(source) || source.startsWith('data:')) continue;
    const pathname = source.split(/[?#]/, 1)[0];
    assert.ok(
      fs.existsSync(path.join(baseDirectory, pathname)),
      'Missing local script referenced by HTML: ' + source
    );
  }
}

function checkSocialPreview(html, baseDirectory) {
  const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  assert.ok(match, 'Open Graph image metadata is missing');
  const url = new URL(match[1]);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'mansdarbs.eu');
  assert.ok(
    fs.existsSync(path.join(baseDirectory, url.pathname.replace(/^\//, ''))),
    'Open Graph image file is missing: ' + url.pathname
  );
  assert.match(html, /<meta\s+property=["']og:image:type["']\s+content=["']image\/(?:png|jpeg)["']/i);
}

test('Cloudflare Pages root references existing local scripts and a real PNG share image', () => {
  const html = read('index.html');
  checkLocalScripts(html, root);
  checkSocialPreview(html, root);
  assert.ok(fs.existsSync(path.join(root, 'functions/api/vid-assistant.js')));
  assert.ok(fs.existsSync(path.join(root, 'funding-discovery.js')));
  assert.ok(fs.existsSync(path.join(root, 'funding-ui.js')));
  assert.match(html, /id=\"fundingSection\"/);
  assert.ok(fs.existsSync(path.join(root, 'funding-programs.json')));
  assert.ok(fs.existsSync(path.join(root, 'funding-sources.json')));
});

test('Guide buttons expose and synchronize their expanded state', () => {
  const html = read('index.html');
  const buttons = [...html.matchAll(/<button\b[^>]*onclick="showGuide\(\)"[^>]*>/g)].map(match => match[0]);
  assert.equal(buttons.length, 2);
  for (const button of buttons) {
    assert.match(button, /aria-controls="guide"/);
    assert.match(button, /aria-expanded="false"/);
  }
  assert.match(html, /function setGuideExpanded\(expanded\)/);
  assert.match(html, /setGuideExpanded\(opening\)/);
  assert.match(html, /setGuideExpanded\(false\)/);
});

test('Worker static-assets copy references existing local scripts and a real PNG share image', () => {
  const publicDirectory = path.join(root, 'public');
  const html = read('public/index.html');
  checkLocalScripts(html, publicDirectory);
  checkSocialPreview(html, publicDirectory);
  assert.ok(fs.existsSync(path.join(publicDirectory, 'funding-discovery.js')));
  assert.ok(fs.existsSync(path.join(publicDirectory, 'funding-ui.js')));
  assert.match(html, /id=\"fundingSection\"/);
  assert.ok(fs.existsSync(path.join(publicDirectory, 'funding-programs.json')));
  assert.ok(fs.existsSync(path.join(publicDirectory, 'funding-sources.json')));
});

test('Interactive disclosure controls reference unique elements on both site copies', () => {
  for (const relativePath of ['index.html', 'public/index.html']) {
    const html = read(relativePath);
    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
    const counts = new Map();
    for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
    const duplicates = [...counts].filter(([, count]) => count > 1).map(([id]) => id);
    assert.deepEqual(duplicates, [], relativePath + ' contains duplicate element IDs');

    const controlledIds = [...html.matchAll(/\baria-controls=["']([^"']+)["']/g)]
      .flatMap(match => match[1].trim().split(/\s+/));
    for (const id of controlledIds) {
      assert.equal(counts.get(id), 1, relativePath + ' references a missing or non-unique aria-controls target: ' + id);
    }
  }
});

test('Anonymous visitor tracking requires explicit consent before reading or writing visitor data', () => {
  const tracking = read('functions/api/track.js');
  const handler = tracking.slice(tracking.indexOf('export async function onRequestPost'));
  const parseBody = handler.indexOf('body = await request.json()');
  const consentGuard = handler.indexOf('if (body?.consent !== true)');
  const cookieRead = handler.indexOf('getCookie(request, COOKIE)');
  const randomId = handler.indexOf('crypto.randomUUID()');
  const storageWrite = handler.indexOf('env.VISITS.put(');

  assert.notEqual(parseBody, -1, 'Tracking request body must be parsed');
  assert.notEqual(consentGuard, -1, 'Tracking endpoint must require explicit consent');
  assert.ok(parseBody < consentGuard, 'Consent must be read from the request');
  assert.ok(consentGuard < cookieRead, 'Consent must be checked before reading the visitor cookie');
  assert.ok(consentGuard < randomId, 'Consent must be checked before creating a visitor identifier');
  assert.ok(consentGuard < storageWrite, 'Consent must be checked before writing analytics data');
});
test('Browser code only sends user content through explicitly consented VID assistant endpoints', () => {
  const browserFiles = [
    'index.html',
    'context-engine.js',
    'contextual-help.js',
    'industry-modules.js',
    'public/index.html',
    'public/contextual-help.js',
    'public/industry-modules.js'
  ];
  const networkCalls = [];

  for (const relativePath of browserFiles) {
    const source = read(relativePath);
    for (const match of source.matchAll(/\bfetch\s*\(/g)) {
      networkCalls.push({ path: relativePath, line: source.slice(0, match.index).split('\n').length });
    }
    assert.doesNotMatch(source, /\bXMLHttpRequest\b|\bnavigator\.sendBeacon\s*\(|\bnew\s+WebSocket\s*\(|\bnew\s+EventSource\s*\(/,
      relativePath + ' must not introduce an unreviewed browser network channel');
  }

  assert.deepEqual(networkCalls.map(call => call.path).sort(), ['index.html', 'public/index.html']);
  for (const relativePath of ['index.html', 'public/index.html']) {
    const html = read(relativePath);
    const consent = html.indexOf("window.confirm('Pirms nosūtīšanas:");
    const addMessage = html.indexOf("chatHistory.push({role:'user',content:question})");
    const sendRequest = html.indexOf("body:JSON.stringify({messages:chatHistory,profile:profile.value,task:current,consent:true})");
    assert.notEqual(consent, -1, relativePath + ' must request explicit consent');
    assert.ok(consent < addMessage, relativePath + ' must request consent before adding the question');
    assert.ok(addMessage < sendRequest, relativePath + ' must add the question before sending it');
    assert.match(html, /sessionStorage\.setItem\(consentKey,'yes'\)/);
  }
});


test('VSAOI help callout is well-formed and explains excluded agricultural support', () => {
  const html = read('index.html');
  const start = html.indexOf('<strong>VSAOI aprēķina pamatprincipi</strong>');
  const end = html.indexOf('</section>', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const callout = html.slice(start, end);
  assert.doesNotMatch(callout, />undefined\b/);
  assert.match(callout, /VSAOI objektā neiekļauj valsts un ES atbalstu lauksaimniecībai/);
  assert.match(callout, /<\/a><\/p><\/div>/);
});
