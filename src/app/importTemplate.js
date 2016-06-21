const EventEmitter = require('events');

module.exports = class ImportTemplate extends EventEmitter {
  constructor(path) {
    super();

    this.element = null;
    this.link = document.createElement('link');
    this.link.href = path;
    this.link.rel = 'import';
    this.link.onload = (e) => this._onLoad(e);
    this.link.onerror = (e) => this._onError(e);
    this.link.setAttribute('async', '');

    document.head.appendChild(this.link);
  }

  _onLoad() {
    const template = this.link.import.querySelector('template');
    this.element = document.importNode(template.content, true);
    this.emit('load', this.element);
  }

  _onError(err) {
    this.emit('error', err);
  }
};
