# Button Card JS for VSCode Change Log

All notable changes to the `vscode-button-card-js` extension will be documented in this file. Using [Semantic Versioning](https://semver.org/).

## [1.0.0] - 7th March 2026

### Changed

- Treat `[[[ ... ]]]` templates as embedded JavaScript language regions in YAML injections (including token type mapping for non-string tokenization).
- Expand inline YAML injection selectors to cover additional scopes.
- Broaden bracket delimiter matching to support `[[[` and longer opening/closing sequences used by newer button-card [nested templates](https://custom-cards.github.io/button-card/v7.0/examples/js-templates/#nested-custombutton-card).
- Use full JavaScript grammar for block injections to improve multiline parsing behavior.

> :raising_hand_man: _Single line `"[[[ ... ]]]"` templates need to be terminated with a closing semicolon (`;`) or else they can break the syntax highlighting in some cases._

### Fixed

- [#3](https://github.com/wfurphy/vscode-button-card-js/issues/3) Fix inconsistent syntax highlighting and insufficient tokenization of JavaScript code inside `[[[ ... ]]]` blocks. Full language support now provides proper syntax highlighting, commenting, and tokenization for JavaScript code in all contexts.

### Development

- Add automated tests that verify embedded language and token type manifest configuration.

--

## [0.2.3] - 13th January 2023

- Prepare for VSCode Marketplace

## [0.2.2] - 13th January 2023

- Tweak `package.json` for publishing.

## [0.2.2] - 13th January 2023

- Tweak `package.json` for publishing.

## [0.2.1] - 13th January 2023

- Prepare for VSCode Marketplace

## [0.2.0]

### Added

- JS Tripple Square Brackets Injection Grammar for YAML language.

## [0.1.0]

### Added

- JS Triple Square Bracket Injection Grammar for `home-assistant` YAML language. To be used in combination with [Home Assistant Config Helper](https://github.com/keesschollaart81/vscode-home-assistant) extension.













