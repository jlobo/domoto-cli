const singleton = Symbol();
const singletonEnforcer = Symbol();

module.exports = class Wait {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    this._element = document.createElement('div');
    this._element.classList.add('hide');
    this._element.classList.add('progress');
    this._element.innerHTML = '<div class="indeterminate"></div>';

    const main = document.getElementById('main');
    main.parentElement.insertBefore(this._element, main);

    this.waiting = this.waiting.bind(this);
    this.waited = this.waited.bind(this);
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new Wait(singletonEnforcer);

    return this[singleton];
  }

  waiting() {
    this._element.classList.remove('hide');
  }

  waited() {
    this._element.classList.add('hide');
  }
};
