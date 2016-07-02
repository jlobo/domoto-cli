const InstallComponentValidation = require('./installComponentValidation');
const ImportTemplate = require('domoto/importTemplate');
const InstallError = require('../installError');
const InstallManager = require('../installManager');
const ItemMenu = require('domoto/itemMenu');
const EventEmitter = require('events');
const config = require('../config');
const alert = require('domoto/alert');

module.exports = class InstallComponent extends EventEmitter {
  constructor() {
    super();

    this.form = null;
    this.package = null;
    this.validation = null;
    this.installManager = InstallManager.instance;

    this.itemMenu = new ItemMenu('main');
    this.itemMenu.description = 'Main';
    this.itemMenu.addLeftIcon('home');

    this.body = new ImportTemplate(config.getPath('/view/templates/install.html'));
    this.body.on('load', element => this._init(element));
  }

  _init() {
    this.form = this.body.document.querySelector('form');
    this.package = this.body.document.getElementById('package');
    this.validation = new InstallComponentValidation(this.form);

    this.installManager.on('error', (err, name) => this._extensionError(err, name));
    this.installManager.on('removed', extension => this._extensionRemoved(extension));
    this.installManager.on('installed', extension => this._extensionInstalled(extension));
    this.form.addEventListener('submit', e => this._installExtension(e));

    this.validation.validate();
    this.emit('ready', this);
  }

  _installExtension(e) {
    e.preventDefault();
    if (!this.validation.isValid)
      return false;

    this.installManager.install(this.package.value);
  }

  _extensionError(err, name) {
    if (err instanceof InstallError)
      return alert(err.message);

    if (err.code === 'E404')
      return alert(`La extensión "${name}" no existe`);

    if (err.code === 'EAI_AGAIN')
      return alert('Es necesario el acceso a internet para instalar la extensión');

    alert('Lo sentimos, se presentó un error interno de la aplicación');
    console.error(err);
  }

  _extensionInstalled(extension) {
    alert(`La extensión "${extension.name}" fue instalada exitosamente`);
  }

  _extensionRemoved(extension) {
    alert(`La extensión "${extension.name}" fue removida exitosamente`);
  }
};
