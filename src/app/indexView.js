const Menu = require('./menu');
const ExtensionManager = require('./extensionManager');


// Cambiar a miniscula el nombre de este archivo
module.exports = new (class IndexView {
  constructor() {
    this.btnCollapse = $('#btnCollapse');
    this.btnCollapseHidden = $('#btnCollapseHidden');
    this.layout = $('#main, #header, #footer, #nav');
    this.menu = Menu.instance;
    this.extensionManager = new ExtensionManager();

    this.init();
  }

  init() {
    $(window).on('resize', e => this.onResizeWindow(e));
    this.menu.on('collapse', e => this.onClickCollapse(e));
    this.btnCollapse.on('click', e => this.onClickCollapse(e));

    this.btnCollapseHidden.sideNav();
    this.extensionManager.init();
  }

  onResizeWindow() {
    if (window.innerWidth <= 992)
      this._showMenu();
  }

  onClickCollapse() {
    if (window.innerWidth > 992) {
      this.menu.toggleShow();
      this.layout.toggleClass('hide-menu');
    }
    else {
      this._showMenu();
      this.btnCollapseHidden.click();
    }
  }

  _showMenu() {
    this.menu.show();
    this.layout.removeClass('hide-menu');
  }
})();
