const EventEmitter = require('events');

module.exports = class ItemMenu extends EventEmitter {
  constructor(plugin) {
    super();

    const template = document.getElementById('itemMenuTemplate').import.querySelector('template');

    this._plugin = plugin;
    this._element = document.importNode(template.content, true);
    this._header = this._element.querySelector('.collapsible-header').lastChild;
    this._body = this._element.querySelector('.collapsible-body');

    this._configure();
  }

  add(root) {
    root.appendChild(this._element);
    this._element = root.lastElementChild;
  }

  remove() {
    this._element.remove();
  }

  _configure() {
    this._setHeader(this._plugin);
    $('.collapsible:first', this._element).collapsible();
    this._element.querySelector('.collapsible-body li a')
      .addEventListener('click', (e) => this.emit('remove', e, this._plugin));
  }

  _setHeader(header) {
    this._header.textContent = header;
  }

  _setBody(...items) {
    const ul = this._body.appendChild(document.createElement('ul'));
    ul.innerHTML = items.map(item => `<li><a href="#!">${item}</a></li>`).join('');
  }
};
