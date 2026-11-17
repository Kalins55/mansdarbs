const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('funding source registry contains unique official HTTPS sources with verification dates', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'funding-sources.json'), 'utf8'));
  assert.equal(registry.schemaVersion, 1);
  assert.equal(registry.country, 'LV');
  assert.match(registry.verifiedAt, /^\\d{4}-\\d{2}-\\d{2}$/);
  assert.ok(Array.isArray(registry.sources) && registry.sources.length >= 5);

  const ids = registry.sources.map(source => source.id);
  assert.equal(new Set(ids).size, ids.length, 'Source IDs must be unique');

  for (const source of registry.sources) {
    assert.ok(source.name && source.institution, 'Source name and institution are required');
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:', source.id + ' must use HTTPS');
    assert.ok(source.sourceType, source.id + ' must declare a source type');
    assert.ok(Array.isArray(source.coverage) && source.coverage.length > 0);
    assert.ok(Array.isArray(source.supportTypes) && source.supportTypes.length > 0);
    assert.ok(source.notes, source.id + ' must explain source limitations');
  }
});

test('funding registry distinguishes sector catalogues, national aggregation and direct EU calls', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'funding-sources.json'), 'utf8'));
  const types = new Set(registry.sources.map(source => source.sourceType));
  assert.ok(types.has('national_aggregator'));
  assert.ok(types.has('sector_catalogue'));
  assert.ok(types.has('eu_direct_calls_portal'));
});
