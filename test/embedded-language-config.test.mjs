import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Loads the extension manifest for configuration assertions.
 * @returns {Record<string, unknown>} Parsed package.json object.
 */
function loadManifest() {
  return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
}

/**
 * Finds grammar contributions by scope name.
 * @param {Record<string, unknown>} manifest Parsed extension manifest.
 * @returns {{inline: Record<string, unknown>, block: Record<string, unknown>}} Inline and block grammar entries.
 */
function getButtonCardGrammars(manifest) {
  const grammars = manifest.contributes?.grammars;
  assert.ok(Array.isArray(grammars), 'Expected contributes.grammars to be an array');

  const inline = grammars.find((grammar) => grammar.scopeName === 'js-inline.injection');
  const block = grammars.find((grammar) => grammar.scopeName === 'js-block.injection');

  assert.ok(inline, 'Missing js-inline.injection grammar contribution');
  assert.ok(block, 'Missing js-block.injection grammar contribution');

  return { inline, block };
}

test('inline and block injections declare embedded javascript language', () => {
  const { inline, block } = getButtonCardGrammars(loadManifest());

  assert.equal(inline.embeddedLanguages?.['meta.embedded.inline.js'], 'javascript');
  assert.equal(block.embeddedLanguages?.['meta.embedded.block.js'], 'javascript');
});

test('embedded javascript scopes are tokenized as non-string content', () => {
  const { inline, block } = getButtonCardGrammars(loadManifest());

  assert.equal(inline.tokenTypes?.['meta.embedded.inline.js'], 'other');
  assert.equal(block.tokenTypes?.['meta.embedded.block.js'], 'other');
});
