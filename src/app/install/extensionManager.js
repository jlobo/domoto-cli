const Menu = require('../menu');
const ItemMenu = require('domoto/itemMenu');
const Extension = require('./extension');
const InstallView = require('./installView');
const MiaCucina = require('domoto-mia-cucina');

module.exports = class ExtensionManager {
  constructor() {
    this.items = [];
    this.visibleBody = null;
    this.menu = Menu.instance;
    this.extension = Extension.instance;
    this.components = [new InstallView(), new MiaCucina()];
    this.main = document.getElementById('main');
  }

  init() {
    this.extension.on('installed', extension => this.add(this._createItemMenu(extension.name)));
    this.extension.on('removed', extension => this.remove(extension.name));

    for (let i = 0; i < this.components.length; i++)
      this.components[i].on('ready', view => this._loadView(view));

    const extensions = Object.keys(this.extension.list);
    for (let i = 0; i < extensions.length; i++)
      this.add(this._createItemMenu(extensions[i]));
  }

  _loadView(view) {
    view.itemMenu.on('click', e => this._onClickItemMenu(e, view));
    this.add(view.itemMenu, true);

    this._changeView(view.body);
    view.body.add(this.main);
  }

  add(item, first = false) {
    this.items[item.code] = item;
    item.on('remove', (e, extensionRemove) => this.onRemoveExtension(e, extensionRemove));
    this.menu.add(item, first);
  }

  remove(extension) {
    this.items[extension].remove();
    delete this.items[extension];
  }

  onRemoveExtension(e, extension) {
    this.extension.remove(extension);
  }

  _createItemMenu(name) {
    const item = new ItemMenu(name);
    item.description = name;
    item.addLeftIcon('power_settings_new');
    item.setRemoveBody();

    return item;
  }

  _changeView(body) {
    if (this.visibleBody)
      this.visibleBody.hide();

    body.show();
    this.visibleBody = body;
  }

  _onClickItemMenu(e, view) {
    this._changeView(view.body);
  }
};
