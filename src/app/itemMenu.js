const EventEmitter = require('events');
const Confirm = require('./confirm');

module.exports = class ItemMenu extends EventEmitter {
  constructor(extension) {
    super();

    const template = document.getElementById('itemMenuTemplate').import.querySelector('template');

    this.confirm = Confirm.instance;
    this._extension = extension;
    this._element = document.importNode(template.content, true);
    this._header = this._element.querySelector('.collapsible-header');
    this._body = this._element.querySelector('.collapsible-body');

    this._configure();
  }

  add(root, first = false) {
    if (first) {
      root.insertBefore(this._element, root.children[1]);
      this._element = root.firstElementChild;
    }
    else {
      root.appendChild(this._element);
      this._element = root.lastElementChild;
    }
  }

  remove() {
    this._element.remove();
  }

  _configure() {
    $('.collapsible:first', this._element).collapsible();
    this._setHeader(this._extension);
    this._header.addEventListener('click', e => this.emit('click', e));
    this._element.querySelector('.collapsible-body li a').addEventListener('click', e => this._onClickRemove(e));
  }

  _onClickRemove(e) {
    this.confirm('¿Estas seguro de querer eliminar la extensión?', 'Extensiones')
      .on('confirm', () => this.emit('remove', e, this._extension));
  }

  _setHeader(header) {
    this._header.lastChild.textContent = header;
  }

  _setBody(...items) {
    const ul = this._body.appendChild(document.createElement('ul'));
    ul.innerHTML = items.map(item => `<li><a href="#!">${item}</a></li>`).join('');
  }
};
