'use strict';

const path = require('path');
const {
  createLintDocument,
  findButtonCardJavaScriptRegions,
  getOriginalOffset,
  positionAt
} = require('./button-card-regions');

/**
 * Lints Button-Card JavaScript regions extracted from a YAML document.
 * @param {string} text YAML document text.
 * @param {{
 *   cwd?: string,
 *   filePath?: string,
 *   eslintFactory?: (options: Record<string, unknown>) => { lintText: Function }
 * }} options Linting options.
 * @returns {Promise<Array<{
 *   message: string,
 *   severity: number,
 *   ruleId: string | null,
 *   offset: number,
 *   endOffset: number,
 *   line: number,
 *   column: number,
 *   regionIndex: number
 * }>>} Lint diagnostics mapped to the original YAML document.
 */
async function lintButtonCardJavaScript(text, options = {}) {
  const regions = findButtonCardJavaScriptRegions(text);

  if (regions.length === 0) {
    return [];
  }

  const eslint = await createWorkspaceEslint(options);

  try {
    return await lintRegions(text, regions, eslint, options);
  } catch (error) {
    if (!isMissingConfigError(error) || options.eslintFactory) {
      throw error;
    }

    return lintRegions(text, regions, await createFallbackEslint(options), options);
  }
}

/**
 * Creates an ESLint instance that resolves user workspace configuration.
 * @param {{cwd?: string, eslintFactory?: Function}} options Linting options.
 * @returns {Promise<{ lintText: Function }>} ESLint-compatible linter.
 */
async function createWorkspaceEslint(options) {
  if (options.eslintFactory) {
    return options.eslintFactory({
      cwd: options.cwd,
      ignore: false
    });
  }

  const { ESLint } = require('eslint');

  return new ESLint({
    cwd: options.cwd,
    ignore: false
  });
}

/**
 * Creates an ESLint instance for syntax-only fallback linting.
 * @param {{cwd?: string}} options Linting options.
 * @returns {Promise<{ lintText: Function }>} ESLint-compatible linter.
 */
async function createFallbackEslint(options) {
  const { ESLint } = require('eslint');

  return new ESLint({
    cwd: options.cwd,
    ignore: false,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.js'],
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module'
        }
      }
    ]
  });
}

/**
 * Lints extracted regions and maps ESLint messages into original document offsets.
 * @param {string} text YAML document text.
 * @param {ReturnType<typeof findButtonCardJavaScriptRegions>} regions Extracted regions.
 * @param {{ lintText: Function }} eslint ESLint-compatible linter.
 * @param {{filePath?: string}} options Linting options.
 * @returns {Promise<Array<Record<string, unknown>>>} Original-document diagnostics.
 */
async function lintRegions(text, regions, eslint, options) {
  const diagnostics = [];

  for (const [regionIndex, region] of regions.entries()) {
    const lintDocument = createLintDocument(region);
    const [result] = await eslint.lintText(lintDocument.text, {
      filePath: getLintFilePath(options.filePath, regionIndex)
    });

    for (const message of result.messages) {
      const offset = getOriginalOffset(
        region,
        message.line,
        message.column,
        lintDocument.prefixLineCount
      );

      if (offset === undefined) {
        continue;
      }

      const endOffset = getDiagnosticEndOffset(region, message, lintDocument.prefixLineCount, offset);
      const position = positionAt(text, offset);

      diagnostics.push({
        message: message.message,
        severity: message.severity,
        ruleId: message.ruleId,
        offset,
        endOffset,
        line: position.line,
        column: position.column,
        regionIndex
      });
    }
  }

  return diagnostics;
}

/**
 * Creates a JavaScript-looking virtual path so workspace ESLint file globs apply.
 * @param {string | undefined} filePath Source YAML file path.
 * @param {number} regionIndex Region index in the YAML document.
 * @returns {string} Virtual JavaScript lint path.
 */
function getLintFilePath(filePath, regionIndex) {
  const basePath = filePath || path.join(process.cwd(), 'button-card.yaml');

  return `${basePath}.button-card-${regionIndex}.js`;
}

/**
 * Gets a diagnostic end offset from ESLint message range data.
 * @param {{contentEnd: number, code: string, lineStarts: number[]}} region Extracted region.
 * @param {{endLine?: number, endColumn?: number}} message ESLint message.
 * @param {number} prefixLineCount Number of wrapper lines before region code.
 * @param {number} fallbackOffset Start offset when no end location is available.
 * @returns {number} Original YAML document end offset.
 */
function getDiagnosticEndOffset(region, message, prefixLineCount, fallbackOffset) {
  if (message.endLine && message.endColumn) {
    return getOriginalOffset(region, message.endLine, message.endColumn, prefixLineCount) ?? fallbackOffset + 1;
  }

  return Math.min(fallbackOffset + 1, region.contentEnd);
}

/**
 * Checks whether ESLint failed because no workspace config exists.
 * @param {unknown} error Error thrown by ESLint.
 * @returns {boolean} Whether the error is a missing-config failure.
 */
function isMissingConfigError(error) {
  return error instanceof Error && /Could not find config file/i.test(error.message);
}

module.exports = {
  lintButtonCardJavaScript
};
