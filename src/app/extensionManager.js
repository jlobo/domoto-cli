const Wait = require('./wait');
const Menu = require('./menu');
const alert = require('domoto/alert');
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

    this._wait = Wait.instance;
    this._externalLink = ExternalLink.instance;

    this.installManager.on('removed', extension => this._removed(extension));
    this.installManager.on('installed', extension => this._loadExtension(extension));
    this.installManager.on('require-error', (error, name) => alert(`La extensión "${name}" presento un error interno`));

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

    if (extension.controller.on) {
      extension.controller.on('waiting', this._wait.waiting);
      extension.controller.on('waited', this._wait.waited);
    }

    this.menu.add(extension.itemMenu);
    extension.body.add(this.main);
  }

  remove(extension) {
    this._wait.waiting();
    this.installManager.remove(extension.name);
  }

  _removed(extension) {
    this._wait.waited();
    alert(`La extensión "${extension.name}" fue removida exitosamente`);
    if (this._visibleBody === extension.body)
      this._changeView(this.components[0].body);

    extension.itemMenu.remove();
    extension.body.remove();
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
