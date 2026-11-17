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
  assert.ok(html.includes("root.setAttribute('role','dialog')"));
  assert.ok(html.includes("root.setAttribute('aria-modal','true')"));
  assert.ok(html.includes("root.setAttribute('aria-labelledby','mvaHeading')"));
  assert.ok(html.includes("root.setAttribute('aria-describedby','mvaIntro')"));
  assert.ok(html.includes('previousFocus=returnFocusTo||document.activeElement'));
  assert.ok(html.includes('show(footerLink)'));
  assert.ok(html.includes("root.querySelector('#mvaStepTitle').focus()"));
  assert.ok(html.includes("root.querySelector('#mvaDone h2').focus()"));
  assert.ok(html.includes("else root.querySelector('#mvaAskToggle').focus()"));
  assert.ok(html.includes("document.addEventListener('keydown',trapDialogFocus,true)"));
  assert.ok(html.includes('event.shiftKey'));
  assert.ok(html.includes("document.documentElement.contains(target)&&typeof target.focus==='function')target.focus();"));
});

test('VID assistant keyboard dialog traps focus and closes on Escape', () => {
  const html = read('index.html');
  assert.match(html, /if\(event\.key==='Escape'\)\{event\.preventDefault\(\);close\(\);return;\}/);
  assert.match(html, /if\(event\.key!=='Tab'\)return;/);
  assert.match(html, /event\.shiftKey&&\(document\.activeElement===first\|\|!root\.contains\(document\.activeElement\)\)/);
  assert.match(html, /event\.preventDefault\(\);last\.focus\(\);/);
  assert.match(html, /!event\.shiftKey&&\(document\.activeElement===last\|\|!root\.contains\(document\.activeElement\)\)/);
  assert.match(html, /event\.preventDefault\(\);first\.focus\(\);/);
  assert.match(html, /return !element\.hidden&&element\.getAttribute\('aria-hidden'\)!=='true'&&element\.getClientRects\(\)\.length>0;/);
});

test('VID assistant chat toggle exposes its expanded state to assistive technology', () => {
  const html = read('index.html');
  assert.match(html, /id="mvaAskToggle" aria-controls="mvaChat" aria-expanded="false"/);
  assert.match(html, /setAttribute\('aria-expanded',String\(!panel\.hidden\)\)/);
  assert.match(html, /if\(!panel\.hidden\)root\.querySelector\('#mvaQuestion'\)\.focus\(\)/);
  assert.match(html, /else root\.querySelector\('#mvaAskToggle'\)\.focus\(\)/);
});

test('frequently used mobile controls have at least 44px touch targets', () => {
  const html = read('index.html');
  assert.ok(html.includes('.lang-switch button{min-width:44px;min-height:44px}'));
  assert.ok(html.includes('.nav button{min-height:44px}'));
  assert.ok(html.includes('.shell.home-screen .card .btn{min-height:44px}'));
  assert.ok(html.includes('.record-actions button{min-width:44px;min-height:44px;padding:8px 10px}'));
  assert.ok(html.includes('.md-context-help__actions button{min-height:44px}'));
  assert.ok(html.includes('#mansdarbs-vid-assistant .mva-close{min-width:44px;min-height:44px;padding:8px 12px}'));
  assert.ok(html.includes('class="record-actions"><button class="textlink" style="border:0;background:none;min-width:44px;min-height:44px'));
});
