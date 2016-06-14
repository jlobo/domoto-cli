const Plugin = require('./plugin');
const ItemMenu = require('./itemMenu');
const EventEmitter = require('events');

module.exports = class Menu extends EventEmitter {
  constructor() {
    super();

    this.plugin = Plugin.instance;
    this.menu = document.getElementById('menu');
    this.btnCollapse = document.getElementById('btnMenuCollapse');
  }

  init() {
    this.menu.removeAttribute('style');

    this.plugin.on('add', e => this.onAddPlugin(e));
    this.btnCollapse.addEventListener('click', (e) => this.emit('collapse', e));

    const plugins = Object.keys(this.plugin.list);

    for (let i = 0; i < plugins.length; i++) {
      const item = new ItemMenu();
      item.setHeader(plugins[i]);
      this.add(item);
    }
  }

  onAddPlugin(plugin) {
    const item = new ItemMenu();
    item.setHeader(plugin.name);
    this.add(item);
  }

  add(itemMenu) {
    this.menu.appendChild(itemMenu.element);
  }

  show() {
    this.menu.classList.remove('hide');
  }

  toggleShow() {
    this.menu.classList.toggle('hide');
  }
};
