'use strict';

const vscode = require('vscode');

/**
 * Activates Button-Card JavaScript language services.
 * @param {vscode.ExtensionContext} context VS Code extension context.
 */
function activate(context) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('button-card-js');

  context.subscriptions.push(diagnosticCollection);
}

/**
 * Deactivates the extension.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
