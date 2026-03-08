# Button-Card Javascript Support in YAML for VSCode

![release](https://img.shields.io/github/v/release/wfurphy/vscode-button-card-js)
![license](https://img.shields.io/github/license/wfurphy/vscode-button-card-js)

This is a very niche extension for Visual Studio Code which provides embedded Javascript language support for code blocks in YAML enclosed by triple+ square brackets (`[[[ ... ]]]`). Used when configuring the advanced _javascript templates_ properties of [Button-Card](https://github.com/custom-cards/button-card) cards for Home Assistant Lovelace dashboards.

* Javascript is now treated as an embedded language (not just YAML string content with syntax highlighting).
* "Double quoted" and block YAML strings supported.
* Support for Button-Card 7.0+ [nested templates](https://custom-cards.github.io/button-card/v7.0/examples/js-templates/#nested-custombutton-card) with longer bracket sequences like `[[[[ ... ]]]]`+.
* Works with the standard YAML language and the `home-assistant` YAML language created by the [Home Assistant Config Helper](https://github.com/keesschollaart81/vscode-home-assistant) plugin.

> :raising_hand_man: _I made this while I was working on [Creative Button Card Templates](https://github.com/wfurphy/creative-button-card-templates) and could not handle writing any more JS without syntax highlighting. Hopefully it can also provide you with relief from the same, same, string game!_

## Preview

![VSCode BC JS Example](https://raw.githubusercontent.com/wfurphy/vscode-button-card-js/master/images/vscodebcjs-example.png)

_The preview above is using the OneDark Pro theme, however this plugin will work with any theme that supports yaml and javascript._

## Installation

### Install from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=wfurphy.vscode-button-card-js) or [Open VSX Registry](https://open-vsx.org/extension/wfurphy/vscode-button-card-js)

## Usage

Once installed you don't need to do anything else. Just open a YAML file that contains `[[[ ... ]]]` blocks and you should see the JavaScript syntax highlighting and language features working inside those blocks.

The JavaScript in single line `"[[[ ... ]]]"` templates needs to be terminated with a closing semicolon (`;`) or else it can break the syntax highlighting in some cases.