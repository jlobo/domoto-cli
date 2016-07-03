const shell = require('electron').shell;
const singleton = Symbol();
const singletonEnforcer = Symbol();


module.exports = class ExternalLink {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new ExternalLink(singletonEnforcer);

    return this[singleton];
  }

  apply(document) {
    for (const link of document.querySelectorAll('a[href]')) {
      const url = link.getAttribute('href');
      if (url.indexOf('http') === 0 || url.indexOf('https') === 0)
        link.addEventListener('click', (e) => this._onClick(e, url));
    }
  }

  _onClick(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  }
};
