const Plugin = require('./plugin');
const ItemMenu = require('./itemMenu');
const EventEmitter = require('events');

module.exports = class Menu extends EventEmitter {
  constructor() {
    super();

    this.items = [];
    this.plugin = Plugin.instance;
    this.menu = document.getElementById('menu');
    this.btnCollapse = document.getElementById('btnMenuCollapse');
  }

  init() {
    this.menu.removeAttribute('style');

    this.plugin.on('installed', plugin => this.add(plugin.name));
    this.plugin.on('removed', plugin => this.remove(plugin.name));
    this.btnCollapse.addEventListener('click', (e) => this.emit('collapse', e));

    const plugins = Object.keys(this.plugin.list);

    for (let i = 0; i < plugins.length; i++)
      this.add(plugins[i]);
  }

  add(plugin) {
    const item = this.items[plugin] = new ItemMenu(plugin);
    item.on('remove', (e, pluginRemove) => this.onRemovePlugin(e, pluginRemove));

    item.add(this.menu);
  }

  remove(plugin) {
    this.items[plugin].remove();
    delete this.items[plugin];
  }

  onRemovePlugin(e, plugin) {
    this.plugin.remove(plugin);
  }

  show() {
    this.menu.classList.remove('hide');
  }

  toggleShow() {
    this.menu.classList.toggle('hide');
  }
};
