const Menu = require('./menu');
const InstallManager = require('./installManager');
const InstallComponent = require('./install/installComponent');
const ExternalLink = require('./externalLink');

const singleton = Symbol();
const singletonEnforcer = Symbol();

module.exports = class ExtensionManager {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    this.visibleBody = null;
    this.menu = Menu.instance;
    this.installManager = InstallManager.instance;
    this.components = [new InstallComponent()];
    this.main = document.getElementById('main');
    this._externalLink = ExternalLink.instance;

    this.installManager.on('removed', extension => this.remove(extension));
    this.installManager.on('installed', extension => this._loadExtension(extension));

    this._loadExtension(...this.components);
    this._loadExtension(...this.installManager.getExtensions());
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new ExtensionManager(singletonEnforcer);

    return this[singleton];
  }

  add(extension) {
    extension.itemMenu.on('click', () => this._changeView(extension.body));
    extension.itemMenu.on('remove', () => this.installManager.remove(extension.itemMenu.code));
    this.menu.add(extension.itemMenu);
    this._changeView(extension.body);
    this._externalLink.apply(extension.body);
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
