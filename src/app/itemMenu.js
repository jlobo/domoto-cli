module.exports = class ItemMenu {
  constructor() {
    const template = document.getElementById('itemMenuTemplate').import.querySelector('template');

    this.element = document.importNode(template.content, true);
    this._header = this.element.querySelector('.collapsible-header').lastChild;
    this._body = this.element.querySelector('.collapsible-body');
  }

  setHeader(header) {
    this._header.textContent = header;
  }

  setBody(...items) {
    const ul = this._body.appendChild(document.createElement('ul'));
    ul.innerHTML = items.map(item => `<li><a href="#!">${item}</a></li>`).join('');
  }
};
