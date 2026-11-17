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


test('VID assistant exposes modal semantics and manages keyboard focus', () => {
  const html = read('index.html');
  assert.match(html, /root\\.setAttribute\\('role','dialog'\\)/);
  assert.match(html, /root\\.setAttribute\\('aria-modal','true'\\)/);
  assert.match(html, /root\\.setAttribute\\('aria-labelledby','mvaHeading'\\)/);
  assert.match(html, /root\\.setAttribute\\('aria-describedby','mvaIntro'\\)/);
  assert.match(html, /previousFocus=document\\.activeElement/);
  assert.match(html, /document\\.addEventListener\\('keydown',trapDialogFocus,true\\)/);
  assert.match(html, /event\\.shiftKey/);
  assert.match(html, /document\\.documentElement\\.contains\\(target\\).*target\\.focus\\(\\)/);
});

test('frequently used mobile controls have at least 44px touch targets', () => {
  const html = read('index.html');
  assert.match(html, /\\.lang-switch button\\{[^}]*min-width:44px;min-height:44px\\}/);
  assert.match(html, /\\.nav button\\{min-height:44px\\}/);
  assert.match(html, /\\.record-actions button\\{min-width:44px;min-height:44px/);
  assert.match(html, /\\.md-context-help__actions button\\{min-height:44px\\}/);
  assert.match(html, /#mansdarbs-vid-assistant \\.mva-close\\{min-width:44px;min-height:44px/);
  assert.match(html, /class="record-actions"><button class="textlink" style="[^"]*min-width:44px;min-height:44px/);
});
