const EventEmitter = require('events');
const Confirm = require('./confirm');

module.exports = class ItemMenu extends EventEmitter {
  constructor(extension) {
    super();

    const template = document.getElementById('itemMenuTemplate').import.querySelector('template');

    this.info = extension;
    this.confirm = Confirm.instance;
    this._element = document.importNode(template.content, true);
    this._header = this._element.querySelector('.collapsible-header');
    this._body = this._element.querySelector('.collapsible-body');

    this._configure();
  }

  add(root, first = false) {
    $('.collapsible:first', this._element).collapsible({ accordion: false });

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
    this.setHeader(this.info.name, this.info.icons);
    this._header.addEventListener('click', e => this.emit('click', e));
    this._element.querySelector('.collapsible-body li a').addEventListener('click', e => this._onClickRemove(e));
  }

  _onClickRemove(e) {
    this.confirm('¿Estas seguro de querer eliminar la extensión?', 'Extensiones')
      .on('confirm', () => this.emit('remove', e, this.info.name));
  }

  setHeader(text, icons) {
    this._header.innerHTML = `${icons && icons.left ? this._getIconHeader(icons.left) : ''}
      ${icons && icons.right ? this._getIconHeader(icons.right, true) : ''}
      ${text}`;
  }

  _setBody(...items) {
    const ul = this._body.appendChild(document.createElement('ul'));
    ul.innerHTML = items.map(item => `<li><a href="#!">${item}</a></li>`).join('');
  }
  _getIconHeader(icon, right = false) {
    return `<i class="material-icons ${right ? 'secondary-content' : null}">${icon}</i>`;
  }
};
