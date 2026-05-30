import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { lintButtonCardJavaScript } = require('../src/eslint-service.js');

test('lints extracted Button-Card JavaScript with workspace ESLint config', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'button-card-eslint-'));

  writeFileSync(
    join(cwd, 'eslint.config.mjs'),
    `export default [{
      files: ['**/*.js'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: { entity: 'readonly' }
      },
      rules: { 'no-undef': 'error' }
    }];`
  );

  const text = 'name: "[[[ return missingName; ]]]"\n';
  const diagnostics = await lintButtonCardJavaScript(text, {
    cwd,
    filePath: join(cwd, 'dashboard.yaml')
  });

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].ruleId, 'no-undef');
  assert.equal(diagnostics[0].severity, 2);
  assert.equal(diagnostics[0].message, "'missingName' is not defined.");
  assert.equal(diagnostics[0].line, 1);
  assert.equal(diagnostics[0].column, 19);
});

test('falls back to syntax diagnostics when no workspace ESLint config exists', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'button-card-eslint-'));
  const text = 'name: "[[[ return (; ]]]"\n';
  const diagnostics = await lintButtonCardJavaScript(text, {
    cwd,
    filePath: join(cwd, 'dashboard.yaml')
  });

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].severity, 2);
  assert.equal(diagnostics[0].ruleId, null);
  assert.match(diagnostics[0].message, /Parsing error/u);
});

test('returns no diagnostics when a document has no Button-Card JavaScript regions', async () => {
  const diagnostics = await lintButtonCardJavaScript('name: Plain YAML\n', {
    eslintFactory() {
      throw new Error('ESLint should not be created');
    }
  });

  assert.deepEqual(diagnostics, []);
});
