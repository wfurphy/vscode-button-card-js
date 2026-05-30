'use strict';

const OPENING_DELIMITER_PATTERN = /\[{3,}/g;
const LINT_DOCUMENT_PREFIX = 'async function __buttonCardTemplate() {\n';
const LINT_DOCUMENT_SUFFIX = '\n}\n';

/**
 * Finds JavaScript regions enclosed by Button-Card triple-or-longer brackets.
 * @param {string} text YAML document text.
 * @returns {Array<{
 *   openingStart: number,
 *   contentStart: number,
 *   contentEnd: number,
 *   closingEnd: number,
 *   delimiterLength: number,
 *   code: string,
 *   lineStarts: number[]
 * }>} Extracted JavaScript regions.
 */
function findButtonCardJavaScriptRegions(text) {
  const regions = [];
  const openingPattern = new RegExp(OPENING_DELIMITER_PATTERN);
  let openingMatch = openingPattern.exec(text);

  while (openingMatch) {
    const delimiterLength = openingMatch[0].length;
    const contentStart = openingMatch.index + delimiterLength;
    const closing = findClosingDelimiter(text, contentStart, delimiterLength);

    if (!closing) {
      openingPattern.lastIndex = contentStart;
      openingMatch = openingPattern.exec(text);
      continue;
    }

    const code = text.slice(contentStart, closing.start);

    regions.push({
      openingStart: openingMatch.index,
      contentStart,
      contentEnd: closing.start,
      closingEnd: closing.end,
      delimiterLength,
      code,
      lineStarts: getLineStarts(code)
    });

    openingPattern.lastIndex = closing.end;
    openingMatch = openingPattern.exec(text);
  }

  return regions;
}

/**
 * Creates a complete lintable JavaScript document for a Button-Card region.
 * @param {{code: string}} region Extracted Button-Card JavaScript region.
 * @returns {{text: string, prefixLineCount: number}} Lintable JavaScript source.
 */
function createLintDocument(region) {
  return {
    text: `${LINT_DOCUMENT_PREFIX}${region.code}${LINT_DOCUMENT_SUFFIX}`,
    prefixLineCount: countLineBreaks(LINT_DOCUMENT_PREFIX)
  };
}

/**
 * Maps a lint document position back into the original YAML document offset.
 * @param {{contentStart: number, lineStarts: number[], code: string}} region Extracted JavaScript region.
 * @param {number} lintLine One-based line number in the lint document.
 * @param {number} lintColumn One-based column number in the lint document.
 * @param {number} prefixLineCount Number of wrapper lines before the region code.
 * @returns {number | undefined} Original YAML document offset, or undefined for wrapper-only positions.
 */
function getOriginalOffset(region, lintLine, lintColumn, prefixLineCount) {
  const codeLineIndex = lintLine - prefixLineCount - 1;

  if (codeLineIndex < 0 || codeLineIndex >= region.lineStarts.length) {
    return undefined;
  }

  const lineStart = region.lineStarts[codeLineIndex];
  const nextLineStart = region.lineStarts[codeLineIndex + 1] ?? region.code.length;
  const lineEnd = nextLineStart > lineStart && region.code[nextLineStart - 1] === '\n'
    ? nextLineStart - 1
    : nextLineStart;
  const columnOffset = Math.min(Math.max(lintColumn - 1, 0), lineEnd - lineStart);

  return region.contentStart + lineStart + columnOffset;
}

/**
 * Converts a zero-based document offset into a one-based line/column position.
 * @param {string} text Source document text.
 * @param {number} offset Zero-based document offset.
 * @returns {{line: number, column: number}} One-based line and column.
 */
function positionAt(text, offset) {
  const safeOffset = Math.min(Math.max(offset, 0), text.length);
  let line = 1;
  let lineStart = 0;

  for (let index = 0; index < safeOffset; index += 1) {
    if (text[index] === '\n') {
      line += 1;
      lineStart = index + 1;
    }
  }

  return {
    line,
    column: safeOffset - lineStart + 1
  };
}

/**
 * Finds a closing bracket run matching the opening delimiter length.
 * @param {string} text Source document text.
 * @param {number} fromOffset Offset where content starts.
 * @param {number} delimiterLength Required closing delimiter length.
 * @returns {{start: number, end: number} | undefined} Closing delimiter range.
 */
function findClosingDelimiter(text, fromOffset, delimiterLength) {
  let index = fromOffset;

  while (index < text.length) {
    if (text[index] !== ']') {
      index += 1;
      continue;
    }

    let end = index + 1;

    while (text[end] === ']') {
      end += 1;
    }

    if (end - index >= delimiterLength) {
      return { start: index, end };
    }

    index = end;
  }

  return undefined;
}

/**
 * Gets zero-based line start offsets for a string.
 * @param {string} text Source text.
 * @returns {number[]} Offsets where each line starts.
 */
function getLineStarts(text) {
  const starts = [0];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n' && index + 1 < text.length) {
      starts.push(index + 1);
    }
  }

  return starts;
}

/**
 * Counts line breaks in a string.
 * @param {string} text Source text.
 * @returns {number} Number of newline characters.
 */
function countLineBreaks(text) {
  let count = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') {
      count += 1;
    }
  }

  return count;
}

module.exports = {
  createLintDocument,
  findButtonCardJavaScriptRegions,
  getOriginalOffset,
  positionAt
};
