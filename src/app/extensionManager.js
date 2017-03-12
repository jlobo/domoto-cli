const Menu = require('./menu');
const ExternalLink = require('./externalLink');
const InstallManager = require('./installManager');
const InstallComponent = require('./install/installComponent');

const singleton = Symbol();
const singletonEnforcer = Symbol();

module.exports = class ExtensionManager {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    this._visibleBody = null;
    this.menu = Menu.instance;
    this.installManager = InstallManager.instance;
    this.components = [new InstallComponent()];
    this.main = document.getElementById('main');
    this._externalLink = ExternalLink.instance;

    this.installManager.on('removed', extension => this._onRemoved(extension));
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
    extension.on('remove', () => this.remove(extension));
    this._externalLink.apply(extension.body);

    extension.body.hide();
    if (!this._visibleBody)
      this._changeView(extension.body);

    this.menu.add(extension.itemMenu);
    extension.body.add(this.main);
  }

  remove(extension) {
    this.installManager.remove(extension.name);
  }

  _onRemoved(extension) {
    extension.remove();

    if (this._visibleBody === extension.body)
      this._changeView(this.components[0].body);
  }

  _loadExtension(...extensions) {
    for (const extension of extensions) {
      if (extension)
        extension.on('ready', () => this.add(extension));
    }
  }

  _changeView(body) {
    if (this._visibleBody)
      this._visibleBody.hide();

    body.show();
    this._visibleBody = body;
  }
};
