module.exports = new (class IndexView {
  constructor() {
    this.btnCollapse = $('#btnCollapse, #btnMenuCollapse');
    this.btnCollapseHidden = $('#btnCollapseHidden');
    this.menu = $('#menu');
    this.layout = $('#main, #header, #footer, #nav');

    this.init();
  }

  init() {
    $(window).on('resize', e => this.onResizeWindow(e));
    this.btnCollapse.on('click', e => this.onClickCollapse(e));
    this.btnCollapseHidden.sideNav();
    this.menu.removeAttr('style');
  }

  onResizeWindow() {
    if (window.innerWidth <= 992) {
      this._showMenu();
    }
  }

  onClickCollapse() {
    if (window.innerWidth > 992) {
      this.menu.toggleClass('hide');
      this.layout.toggleClass('hide-menu');
    }
    else {
      this._showMenu();
      this.btnCollapseHidden.click();
    }
  }

  _showMenu() {
    this.menu.removeClass('hide');
    this.layout.removeClass('hide-menu');
  }
})();
