const alert = require('domoto/alert');
const EventEmitter = require('events');
const InstallError = require('../installError');
const InstallManager = require('../installManager');
const InstallControllerValidation = require('./installControllerValidation');

module.exports = class InstallController extends EventEmitter {
  constructor(template, itemMenu) {
    super();

    this._disabled = false;

    this.itemMenu = itemMenu;
    this.button = template.querySelector('button');
    this.form = template.document.querySelector('form');
    this.package = template.document.getElementById('package');
    this.validation = new InstallControllerValidation(this.form);

    this.installManager = InstallManager.instance;
    this.installManager.on('error', (err, name) => this._extensionError(err, name));
    this.installManager.on('installed', extension => this._extensionInstalled(extension));
    this.form.addEventListener('submit', e => this._onSubmit(e));

    this.validation.validate();
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(disabled) {
    this._disabled = disabled;
    this.form.disabled = disabled;
    this.button.disabled = disabled;
    this.button.classList[disabled ? 'add' : 'remove']('disabled');
  }

  install(extensionName) {
    if (this.disabled)
      return alert('Lo sentimos, espere hasta que se acabe la instalación actual');

    this.disabled = true;
    this.emit('waiting', this);
    this.installManager.install(extensionName);
  }

  _onSubmit(e) {
    e.preventDefault();
    if (!this.validation.isValid)
      return false;

    this.install(this.package.value);
  }

  _extensionError(err, name) {
    this.disabled = false;
    this.emit('waited', this);

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
    this.disabled = false;
    alert(`La extensión "${extension.name}" fue instalada exitosamente`);
    this.emit('waited', this);
  }
};
