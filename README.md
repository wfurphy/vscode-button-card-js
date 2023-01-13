# Button Card Javascript Syntax Highlighting in VSCode

![release](https://img.shields.io/github/v/release/wfurphy/vscode-button-card-js)
![license](https://img.shields.io/github/license/wfurphy/vscode-button-card-js)

This is a very niche extension for Visual Studio Code which provides syntax highlighting of Javascript code blocks in YAML which are enclosed by triple square brackets (`[[[ ... ]]]`). Used when configuring the advanced _javascript templates_ properties of [Button-Card](https://github.com/custom-cards/button-card) cards for Home Assistant Lovelace dashboards.

* Syntax highlighting provided using built-in Javascript grammar
* "Double quoted" and block YAML strings supported
* Works with the standard YAML language and the `home-assistant` YAML language created by the [Home Assistant Config Helper](https://github.com/keesschollaart81/vscode-home-assistant) plugin.

_I made this while I was working on [Creative Button Card Templates](https://github.com/wfurphy/creative-button-card-templates) and could not handle writing any more JS without syntax highlighting. Hopefully it gives someone else the same relief it gave me._

## Installation

### [Install from VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=wfurphy.vscode-button-card-js)

## Preview

![VSCode BC JS Example](https://raw.githubusercontent.com/wfurphy/vscode-button-card-js/master/images/vscodebcjs-example.png)

_The preview above is using the OneDark Pro theme, however this plugin will work with any theme that supports yaml and javascript._