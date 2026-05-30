'use strict';

const vscode = require('vscode');
const { lintButtonCardJavaScript } = require('./eslint-service');

const CONFIG_SECTION = 'buttonCardJs.eslint';
const SUPPORTED_LANGUAGES = new Set(['yaml', 'home-assistant']);

/**
 * Activates Button-Card JavaScript language services.
 * @param {vscode.ExtensionContext} context VS Code extension context.
 */
function activate(context) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('button-card-js');
  const pendingLintTimers = new Map();

  /**
   * Schedules linting after document edits settle.
   * @param {vscode.TextDocument} document Text document to lint.
   * @param {number} delay Delay in milliseconds.
   */
  function scheduleLint(document, delay = 250) {
    if (!isSupportedDocument(document)) {
      return;
    }

    const existingTimer = pendingLintTimers.get(document.uri.toString());

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    pendingLintTimers.set(
      document.uri.toString(),
      setTimeout(() => {
        pendingLintTimers.delete(document.uri.toString());
        lintDocument(document, diagnosticCollection);
      }, delay)
    );
  }

  for (const document of vscode.workspace.textDocuments) {
    scheduleLint(document, 0);
  }

  context.subscriptions.push(
    diagnosticCollection,
    vscode.workspace.onDidOpenTextDocument((document) => scheduleLint(document, 0)),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (getRunMode() === 'onType') {
        scheduleLint(event.document);
      }
    }),
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (getRunMode() === 'onSave') {
        scheduleLint(document, 0);
      }
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString();
      const timer = pendingLintTimers.get(key);

      if (timer) {
        clearTimeout(timer);
        pendingLintTimers.delete(key);
      }

      diagnosticCollection.delete(document.uri);
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration(CONFIG_SECTION)) {
        return;
      }

      for (const document of vscode.workspace.textDocuments) {
        scheduleLint(document, 0);
      }
    }),
    new vscode.Disposable(() => {
      for (const timer of pendingLintTimers.values()) {
        clearTimeout(timer);
      }

      pendingLintTimers.clear();
    })
  );
}

/**
 * Deactivates the extension.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate
};

/**
 * Lints a supported document and publishes VS Code diagnostics.
 * @param {vscode.TextDocument} document Text document to lint.
 * @param {vscode.DiagnosticCollection} diagnosticCollection Diagnostic collection to update.
 * @returns {Promise<void>}
 */
async function lintDocument(document, diagnosticCollection) {
  if (!isLintingEnabled() || !isSupportedDocument(document)) {
    diagnosticCollection.delete(document.uri);
    return;
  }

  const version = document.version;

  try {
    const diagnostics = await lintButtonCardJavaScript(document.getText(), {
      cwd: getWorkspaceFolderPath(document),
      filePath: document.uri.scheme === 'file' ? document.uri.fsPath : undefined
    });

    if (document.version !== version) {
      return;
    }

    diagnosticCollection.set(
      document.uri,
      diagnostics.map((diagnostic) => createDiagnostic(document, diagnostic))
    );
  } catch (error) {
    if (document.version !== version) {
      return;
    }

    diagnosticCollection.set(document.uri, [createExtensionErrorDiagnostic(document, error)]);
  }
}

/**
 * Converts a mapped ESLint diagnostic into a VS Code diagnostic.
 * @param {vscode.TextDocument} document Text document containing the diagnostic.
 * @param {{message: string, severity: number, ruleId: string | null, offset: number, endOffset: number}} diagnostic Mapped lint diagnostic.
 * @returns {vscode.Diagnostic} VS Code diagnostic.
 */
function createDiagnostic(document, diagnostic) {
  const vscodeDiagnostic = new vscode.Diagnostic(
    new vscode.Range(document.positionAt(diagnostic.offset), document.positionAt(diagnostic.endOffset)),
    diagnostic.ruleId ? `${diagnostic.message} (${diagnostic.ruleId})` : diagnostic.message,
    getDiagnosticSeverity(diagnostic.severity)
  );

  vscodeDiagnostic.source = 'button-card-js eslint';
  vscodeDiagnostic.code = diagnostic.ruleId || undefined;

  return vscodeDiagnostic;
}

/**
 * Creates a document-level diagnostic for ESLint execution failures.
 * @param {vscode.TextDocument} document Text document being linted.
 * @param {unknown} error Linting error.
 * @returns {vscode.Diagnostic} VS Code diagnostic.
 */
function createExtensionErrorDiagnostic(document, error) {
  const message = error instanceof Error ? error.message : String(error);
  const range = new vscode.Range(document.positionAt(0), document.positionAt(Math.min(1, document.getText().length)));
  const diagnostic = new vscode.Diagnostic(
    range,
    `Button-Card ESLint failed: ${message}`,
    vscode.DiagnosticSeverity.Error
  );

  diagnostic.source = 'button-card-js eslint';

  return diagnostic;
}

/**
 * Maps ESLint severity to VS Code severity.
 * @param {number} severity ESLint severity value.
 * @returns {vscode.DiagnosticSeverity} VS Code diagnostic severity.
 */
function getDiagnosticSeverity(severity) {
  return severity === 2 ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
}

/**
 * Checks if linting is enabled in user configuration.
 * @returns {boolean} Whether linting is enabled.
 */
function isLintingEnabled() {
  return vscode.workspace.getConfiguration(CONFIG_SECTION).get('enable', true);
}

/**
 * Reads the configured lint run mode.
 * @returns {'onType' | 'onSave'} Lint run mode.
 */
function getRunMode() {
  return vscode.workspace.getConfiguration(CONFIG_SECTION).get('run', 'onType');
}

/**
 * Checks if the document language can contain Button-Card JavaScript templates.
 * @param {vscode.TextDocument} document Text document to inspect.
 * @returns {boolean} Whether the document should be linted.
 */
function isSupportedDocument(document) {
  return SUPPORTED_LANGUAGES.has(document.languageId);
}

/**
 * Gets the workspace folder path for ESLint config resolution.
 * @param {vscode.TextDocument} document Text document being linted.
 * @returns {string | undefined} Workspace folder filesystem path.
 */
function getWorkspaceFolderPath(document) {
  return vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
}
