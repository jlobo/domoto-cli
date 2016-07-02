const Menu = require('./menu');
const InstallManager = require('./installManager');
const InstallComponent = require('./install/installComponent');

module.exports = class ExtensionManager {
  constructor() {
    this.visibleBody = null;
    this.menu = Menu.instance;
    this.extension = InstallManager.instance;
    this.components = [new InstallComponent()];
    this.main = document.getElementById('main');

    this.extension.on('removed', extension => this.remove(extension));
    this.extension.on('installed', extension => this._loadExtension(extension));

    this._loadExtension(...this.components);
    this._loadExtension(...this.extension.getExtensions());
  }

  add(extension) {
    extension.itemMenu.on('click', () => this._changeView(extension.body));
    extension.itemMenu.on('remove', () => this.extension.remove(extension.itemMenu.code));
    this.menu.add(extension.itemMenu);
    this._changeView(extension.body);
    extension.body.add(this.main);
  }

  remove(extension) {
    extension.itemMenu.remove();
    extension.body.remove();
  }

  _loadExtension(...extensions) {
    for (const extension of extensions)
      extension.on('ready', () => this.add(extension));
  }

  _changeView(body) {
    if (this.visibleBody)
      this.visibleBody.hide();

    body.show();
    this.visibleBody = body;
  }
};
