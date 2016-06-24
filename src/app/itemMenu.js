const EventEmitter = require('events');
const Confirm = require('./confirm');

module.exports = class ItemMenu extends EventEmitter {
  constructor(code) {
    super();

    this.code = code;
    this.confirm = Confirm.instance;
    this._bodyElement = null;
    this._element = document.createElement('li');
    this._element.classList.add('bold');
    this._element.innerHTML = '<div class="collapsible-header waves-effect waves-light truncate"></div>';
    this._header = this._element.firstElementChild;
    this._header.addEventListener('click', e => this.emit('click', e));
  }

  setHeader(text, icons) {
    this._header.innerHTML = [icons && icons.left ? this._getIconHeader(icons.left) : '',
      icons && icons.right ? this._getIconHeader(icons.right, true) : '',
      text].join('');

    return this;
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

  setRemoveBody() {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#"><i class="material-icons secondary-content">delete</i>Remover</a>';
    li.firstElementChild.addEventListener('click', e => this._onClickRemove(e));

    this._body.appendChild(li);

    return this;
  }

  get _body() {
    if (this._bodyElement)
      return this._bodyElement;

    this._bodyElement = document.createElement('ul');
    const div = document.createElement('div');
    div.classList.add('collapsible-body');
    div.appendChild(this._bodyElement);
    this._header.parentElement.appendChild(div);

    return this._bodyElement;
  }

  _setBody(...items) {
    const ul = this._body.appendChild(document.createElement('ul'));
    ul.innerHTML = items.map(item => `<li><a href="#!">${item}</a></li>`).join('');
  }

  _getIconHeader(icon, right = false) {
    return `<i class="material-icons ${right ? 'secondary-content' : null}">${icon}</i>`;
  }

  _onClickRemove(e) {
    this.confirm('¿Estas seguro de querer eliminar la extensión?', 'Extensiones')
      .on('confirm', () => this.emit('remove', e, this.code));
  }
};
