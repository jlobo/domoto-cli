const EventEmitter = require('events');

const singleton = Symbol();
const singletonEnforcer = Symbol();

module.exports = class Menu extends EventEmitter {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    super();

    this.btnCollapse = document.getElementById('btnMenuCollapse');
    this.element = document.getElementById('menu');
    this.element.removeAttribute('style');
    this.btnCollapse.addEventListener('click', (e) => this.emit('collapse', e));
  }

  add(item, first = false) {
    const root = this.element.lastElementChild.firstElementChild;

    first ? root.insertBefore(item.element, root.children[1])
      : root.appendChild(item.element);
  }

  remove(item) {
    item.remove();
  }

  show() {
    this.element.classList.remove('hide');
  }

  toggleShow() {
    this.element.classList.toggle('hide');
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new Menu(singletonEnforcer);

    return this[singleton];
  }
};
