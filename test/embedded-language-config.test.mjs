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
 * Loads a TextMate grammar JSON file from the extension syntaxes directory.
 * @param {string} fileName Grammar file name.
 * @returns {Record<string, unknown>} Parsed grammar JSON.
 */
function loadGrammar(fileName) {
  return JSON.parse(readFileSync(new URL(`../syntaxes/${fileName}`, import.meta.url), 'utf8'));
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

test('inline grammar supports quoted and plain scalar YAML scopes', () => {
  const inlineGrammar = loadGrammar('js-inline.tmLanguage.json');
  const selector = inlineGrammar.injectionSelector;

  assert.equal(
    selector,
    'L:string.quoted.double, L:string.quoted.single, L:string.unquoted.plain.out, L:string.unquoted.plain.in'
  );
});

test('grammars match three or more bracket delimiters', () => {
  const inlinePattern = loadGrammar('js-inline.tmLanguage.json').patterns?.[0];
  const blockPattern = loadGrammar('js-block.tmLanguage.json').patterns?.[0];

  assert.equal(inlinePattern?.begin, '\\[{3,}');
  assert.equal(inlinePattern?.end, '\\]{3,}');
  assert.equal(blockPattern?.begin, '\\[{3,}');
  assert.equal(blockPattern?.end, '\\]{3,}');
});

test('block grammar uses full JavaScript grammar for multiline template support', () => {
  const blockPattern = loadGrammar('js-block.tmLanguage.json').patterns?.[0];
  const included = blockPattern?.patterns?.[0]?.include;

  assert.equal(included, 'source.js');
});
