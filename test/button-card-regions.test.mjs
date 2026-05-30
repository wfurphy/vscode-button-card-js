import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  createLintDocument,
  findButtonCardJavaScriptRegions,
  getOriginalOffset,
  positionAt
} = require('../src/button-card-regions.js');

test('extracts inline Button-Card JavaScript regions', () => {
  const text = 'name: "[[[ return entity.state; ]]]"\n';
  const [region] = findButtonCardJavaScriptRegions(text);

  assert.equal(region.code, ' return entity.state; ');
  assert.equal(region.delimiterLength, 3);
  assert.equal(region.openingStart, text.indexOf('[[['));
  assert.equal(region.contentEnd, text.indexOf(']]]'));
});

test('extracts multiline block regions', () => {
  const text = [
    'styles:',
    '  card: |',
    '    [[[',
    '      return variables.colour;',
    '    ]]]'
  ].join('\n');
  const [region] = findButtonCardJavaScriptRegions(text);

  assert.equal(region.code, '\n      return variables.colour;\n    ');
});

test('requires closing delimiters to match nested template delimiter length', () => {
  const text = 'label: "[[[[ return `[[[ nested ]]]`; ]]]]"\n';
  const [region] = findButtonCardJavaScriptRegions(text);

  assert.equal(region.delimiterLength, 4);
  assert.equal(region.code, ' return `[[[ nested ]]]`; ');
});

test('creates wrapped lint documents for JavaScript snippets', () => {
  const [region] = findButtonCardJavaScriptRegions('name: "[[[ return entity.state; ]]]"\n');
  const lintDocument = createLintDocument(region);

  assert.match(lintDocument.text, /^async function __buttonCardTemplate\(\) \{\n/);
  assert.match(lintDocument.text, /return entity\.state;/);
  assert.equal(lintDocument.prefixLineCount, 1);
});

test('maps lint document positions to original YAML offsets', () => {
  const text = [
    'styles:',
    '  card: |',
    '    [[[',
    '      return variables.colour;',
    '    ]]]'
  ].join('\n');
  const [region] = findButtonCardJavaScriptRegions(text);
  const lintDocument = createLintDocument(region);
  const originalOffset = getOriginalOffset(region, 3, 14, lintDocument.prefixLineCount);
  const position = positionAt(text, originalOffset);

  assert.equal(text.slice(originalOffset, originalOffset + 'variables'.length), 'variables');
  assert.deepEqual(position, { line: 4, column: 14 });
});
