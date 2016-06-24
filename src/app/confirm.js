const EventEmitter = require('events');

const singleton = Symbol();
const singletonEnforcer = Symbol();

// Permitir que se pueda lanzar múltiples mensajes a la vez
module.exports = class Confirm extends EventEmitter {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    super();

    this._emiter = null;
    this._modal = this._getModal();
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

  _getModal() {
    const template = document.createElement('template');
    template.innerHTML = `<div class="modal">
      <div class="modal-content">
        <h4>Confirmación</h4>
        <p>¿Estas seguro?</p>
      </div>
      <div class="modal-footer">
        <a href="#" class="waves-effect btn-flat">Cancelar</a>
        <a href="#" class="waves-effect waves-teal btn-flat">Confirmar</a>
      </div>
    </div>`;
    return template.content;
  }

  _onClick(e, event) {
    this._modal.closeModal();
    this._emiter.emit(event, e);
  }
};
