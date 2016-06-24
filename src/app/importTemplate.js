const EventEmitter = require('events');

module.exports = class ImportTemplate extends EventEmitter {
  constructor(path) {
    super();

    this.document = null;
    this.container = document.createElement('div');
    this.link = document.createElement('link');
    this.link.href = path;
    this.link.rel = 'import';
    this.link.onload = (e) => this._onLoad(e);
    this.link.onerror = (e) => this._onError(e);
    this.link.setAttribute('async', '');

    document.head.appendChild(this.link);
  }

  add(root) {
    this.container.appendChild(this.document);
    root.appendChild(this.container);
  }

  show() {
    this.container.classList.remove('hide');
  }

  hide() {
    if (!this.container.classList.contains('hide'))
      this.container.classList.add('hide');
  }

  toggleShow() {
    this.container.classList.toggle('hide');
  }

  _onLoad() {
    const template = this.link.import.querySelector('template');
    this.document = document.importNode(template.content, true);
    this.emit('load', this.document);
  }

  _onError(err) {
    console.error(err);
    this.emit('error', err);
  }
};
