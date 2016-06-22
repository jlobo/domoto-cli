const IndexViewValidation = require('./validations/indexViewValidation');
const ImportTemplate = require('./importTemplate');
const InstallError = require('./installError');
const Extension = require('./extension');
const ItemMenu = require('./itemMenu');
const EventEmitter = require('events');
const config = require('./config');
const alert = require('./alert');

module.exports = class installView extends EventEmitter {
  constructor() {
    super();

    this.view = null;
    this.form = null;
    this.package = null;
    this.validation = null;
    this.extension = Extension.instance;
    this.itemMenu = new ItemMenu('main');
    this._template = new ImportTemplate(config.getPath('/view/templates/install.html'));
    this._template.on('load', element => this._init(element));
  }

  _init() {
    this.view = this._template.element;
    this.form = this.view.querySelector('form');
    this.package = this.view.getElementById('package');
    this.validation = new IndexViewValidation(this.form);

    this.extension.on('error', (err, extension) => this._extensionError(err, extension));
    this.extension.on('removed', extension => this._extensionRemoved(extension));
    this.extension.on('installed', extension => this._extensionInstalled(extension));
    this.form.addEventListener('submit', e => this._installExtension(e));

    this.validation.validate();
    this.emit('ready', this);
  }

  _installExtension(e) {
    e.preventDefault();
    if (!this.validation.isValid)
      return false;

    this.extension.install(this.package.value);
  }

  _extensionError(err, extension) {
    if (err instanceof InstallError)
      return alert(err.message);

    if (err.code === 'E404')
      return alert(`La extensión "${extension}" no existe`);

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
