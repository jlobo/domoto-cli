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
    this.main = document.getElementById('main');
    this.components = [new InstallComponent()];
    this._externalLink = ExternalLink.instance;

    this.installManager = InstallManager.instance;
    this.installManager.on('removed', extension => extension.remove());
    this.installManager.on('installed', extension => this.load(extension));

    this.load(...this.components);
    this.load(...this.installManager.getExtensions());
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new ExtensionManager(singletonEnforcer);

    return this[singleton];
  }

  load(...extensions) {
    for (const extension of extensions) {
      if (extension) {
        extension.on('remove', () => this.installManager.remove(extension.name));
        extension.on('loadView', (view) => this._loadView(view));
        this.menu.add(extension.itemMenu);
      }
    }
  }

  _loadView(view) {
    this._externalLink.apply(view);
    view.add(this.main);
  }
};
