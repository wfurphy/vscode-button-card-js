# Button-Card Embeded Javascript Support in YAML for VSCode

![release](https://img.shields.io/github/v/release/wfurphy/vscode-button-card-js)
![license](https://img.shields.io/github/license/wfurphy/vscode-button-card-js)

This is a very niche extension for Visual Studio Code which provides embedded Javascript language support for code blocks in YAML enclosed by triple+ square brackets (`[[[ ... ]]]`). Used when configuring the advanced _javascript templates_ properties of [Button-Card](https://github.com/custom-cards/button-card) cards for Home Assistant Lovelace dashboards.

> :floppy_disk: **What's new in v1.0?** _Full language support means not just more reliable syntax highlighting but also correct commenting, tokenization, formatting, linting and more for JavaScript code inside `[[[ ... ]]]` blocks! Now your Javascript is a first class citizen inside your YAML!_

* Javascript is now treated as an embedded language (not just YAML string content with Syntax Highlighting).
* "Double quoted" and block YAML strings supported.
* Support for Button-Card 7.0+ [nested templates](https://custom-cards.github.io/button-card/v7.0/examples/js-templates/#nested-custombutton-card) with longer bracket sequences like `[[[[ ... ]]]]`+.
* Works with the standard YAML language and the `home-assistant` YAML language created by the [Home Assistant Config Helper](https://github.com/keesschollaart81/vscode-home-assistant) plugin.

> :raising_hand_man: _I made this while I was working on [Creative Button Card Templates](https://github.com/wfurphy/creative-button-card-templates) and could not handle writing any more JS without syntax highlighting. Hopefully it can also provide you with relief from the same, same, string game!_

## Installation

### [Install from VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=wfurphy.vscode-button-card-js)

## Preview

![VSCode BC JS Example](https://raw.githubusercontent.com/wfurphy/vscode-button-card-js/master/images/vscodebcjs-example.png)

_The preview above is using the OneDark Pro theme, however this plugin will work with any theme that supports yaml and javascript._
