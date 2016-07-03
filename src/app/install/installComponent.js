const Domoto = require('domoto');
const InstallController = require('./installController');
const templatePath = require('../config').getPath('/view/templates/install.html');

module.exports = class InstallComponent extends Domoto {
  constructor() {
    super('inicio', templatePath, InstallController);
  }

  get _itemMenuDescription() {
    return 'Inicio';
  }

  get _itemMenuIcon() {
    return 'home';
  }

  get _canRemoveItemMenu() {
    return false;
  }
};
