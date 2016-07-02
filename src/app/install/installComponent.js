const InstallController = require('./installController');
const ImportTemplate = require('domoto/importTemplate');
const ItemMenu = require('domoto/itemMenu');
const EventEmitter = require('events');
const config = require('../config');

module.exports = class InstallComponent extends EventEmitter {
  constructor() {
    super();

    this.controller = null;
    this.name = 'main';
    this.itemMenu = new ItemMenu(this.name);
    this.itemMenu.description = 'Main';
    this.itemMenu.addLeftIcon('home');

    this.body = new ImportTemplate(config.getPath('/view/templates/install.html'));
    this.body.on('load', element => this._init(element));
  }

  _init() {
    this.controller = new InstallController(this.body, this.itemMenu);
    this.emit('ready', this);
  }
};
