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
});
