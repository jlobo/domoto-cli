const EventEmitter = require('events');

const singleton = Symbol();
const singletonEnforcer = Symbol();

// Permitir que se pueda lanzar múltiples mensajes a la vez
module.exports = class Confirm extends EventEmitter {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    super();
    const template = document.getElementById('confirmTemplate').import.querySelector('template');

    this._emiter = null;
    this._modal = document.importNode(template.content, true);
    this._header = this._modal.querySelector('h4');
    this._message = this._modal.querySelector('p');
    this._cancel = this._modal.querySelector('a:first-child');
    this._confirm = this._modal.querySelector('a:last-child');
    this.show = this.show.bind(this);

    this._configure();
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new Confirm(singletonEnforcer);

    return this[singleton].show;
  }

  show(message = '¿Estas seguro?', title = 'Confirmación') {
    this._header.innerText = title;
    this._message.innerText = message;
    this._modal.openModal();

    return (this._emiter = new EventEmitter());
  }

  _configure() {
    document.body.appendChild(this._modal);
    this._modal = $(document.body.lastElementChild);

    this._cancel.addEventListener('click', e => this._onClick(e, 'cancel'));
    this._confirm.addEventListener('click', e => this._onClick(e, 'confirm'));
  }

  _onClick(e, event) {
    this._modal.closeModal();
    this._emiter.emit(event, e);
  }
};
