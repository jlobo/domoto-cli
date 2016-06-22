const Extension = require('./extension');
const ItemMenu = require('./itemMenu');
const EventEmitter = require('events');
const InstallView = require('./installView');

module.exports = class Menu extends EventEmitter {
  constructor() {
    super();

    this.items = [];
    this.visibleBody = null;
    this.extension = Extension.instance;
    this.components = [new InstallView(), new InstallView()];
    this.menu = document.getElementById('menu');
    this.btnCollapse = document.getElementById('btnMenuCollapse');
    this.main = document.getElementById('main');
  }

  init() {
    this.menu.removeAttribute('style');

    this.extension.on('installed', extension => this.add(extension.name));
    this.extension.on('removed', extension => this.remove(extension.name));
    this.btnCollapse.addEventListener('click', (e) => this.emit('collapse', e));

    for (let i = 0; i < this.components.length; i++)
      this.components[i].on('ready', view => this._loadView(view));

    const extensions = Object.keys(this.extension.list);
    for (let i = 0; i < extensions.length; i++)
      this.add(extensions[i]);
  }

  add(extension, first = false) {
    const item = this.items[extension] = extension instanceof ItemMenu
      ? extension
      : new ItemMenu(extension);

    item.on('remove', (e, extensionRemove) => this.onRemoveExtension(e, extensionRemove));

    item.add(this.menu, first);
  }

  remove(extension) {
    this.items[extension].remove();
    delete this.items[extension];
  }

  onRemoveExtension(e, extension) {
    this.extension.remove(extension);
  }

  show() {
    this.menu.classList.remove('hide');
  }

  toggleShow() {
    this.menu.classList.toggle('hide');
  }

  _changeView(body) {
    if (this.visibleBody)
      this.visibleBody.hide();

    body.show();
    this.visibleBody = body;
  }

  _loadView(view) {
    view.itemMenu.on('click', e => this._onClickItemMenu(e, view));
    this.add(view.itemMenu, true);


    this._changeView(view.body);
    view.body.add(this.main);
  }

  _onClickItemMenu(e, view) {
    this._changeView(view.body);
    console.log('click', view.body);
  }
};
