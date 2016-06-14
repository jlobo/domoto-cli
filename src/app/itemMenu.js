module.exports = class ItemMenu {
  constructor() {
    const template = document.getElementById('itemMenuTemplate').import.querySelector('template');
    const clone = document.importNode(template.content, true);

    this.header = clone.querySelector('.collapsible-header');
    this.body = clone.querySelector('.collapsible-body');
    document.getElementById('menu').appendChild(clone);
  }

  setHeader(header) {
    this.header.appendChild(document.createTextNode(header));
  }

  setBody(...items) {
    const ul = this.body.appendChild(document.createElement('ul'));
    ul.innerHTML = items.map(item => `<li><a href="#!">${item}</a></li>`).join('');
  }
};
