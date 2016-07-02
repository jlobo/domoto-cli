const alert = require('domoto/alert');
const InstallError = require('../installError');
const InstallManager = require('../installManager');
const InstallControllerValidation = require('./installControllerValidation');

module.exports = class InstallController {
  constructor(template, itemMenu) {
    this.itemMenu = itemMenu;

    this.form = template.document.querySelector('form');
    this.package = template.document.getElementById('package');
    this.validation = new InstallControllerValidation(this.form);

    this.installManager = InstallManager.instance;
    this.installManager.on('error', (err, name) => this._extensionError(err, name));
    this.installManager.on('removed', extension => this._extensionRemoved(extension));
    this.installManager.on('installed', extension => this._extensionInstalled(extension));
    this.form.addEventListener('submit', e => this._installExtension(e));

    this.validation.validate();
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
