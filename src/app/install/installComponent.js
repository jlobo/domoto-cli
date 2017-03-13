const Domoto = require('domoto');
const InstallController = require('./installController');
const viewPath = require('../config').getPath('/view/templates/install.html');

module.exports = class InstallComponent extends Domoto {
  constructor() {
    super('inicio');

    this.description = 'Inicio';
    this.itemMenu.iconLeft = 'home';
    const view = this.addView(viewPath, InstallController);
    this.itemMenu.on('click', this.viewManager.show(view));
  }

  get isRemovable() {
    return false;
  }
};
