const Extension = require('./extension');
const ItemMenu = require('./itemMenu');
const EventEmitter = require('events');

module.exports = class Menu extends EventEmitter {
  constructor() {
    super();

    this.items = [];
    this.extension = Extension.instance;
    this.menu = document.getElementById('menu');
    this.btnCollapse = document.getElementById('btnMenuCollapse');
  }

  init() {
    this.menu.removeAttribute('style');

    this.extension.on('installed', extension => this.add(extension.name));
    this.extension.on('removed', extension => this.remove(extension.name));
    this.btnCollapse.addEventListener('click', (e) => this.emit('collapse', e));

    const extensions = Object.keys(this.extension.list);

    for (let i = 0; i < extensions.length; i++)
      this.add(extensions[i]);
  }

  add(extension) {
    const item = this.items[extension] = extension instanceof ItemMenu
      ? extension
      : new ItemMenu(extension);
    
    item.on('remove', (e, extensionRemove) => this.onRemoveExtension(e, extensionRemove));

    item.add(this.menu);
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
};
