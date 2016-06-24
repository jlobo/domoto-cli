const { app, BrowserWindow } = require('electron');
const jetpack = require('fs-jetpack');
const config = require('../app/config');

module.exports = class Window {
  constructor(name, options) {
    this.filename = `${name}.json`;
    this.options = options;
    this.userDataDir = jetpack.cwd(app.getPath('userData'));

    this.state = null;
    this.win = null;

    return this.create();
  }

  restoreState() {
    let state = {};

    try {
      state = this.userDataDir.read(this.filename, 'json');
    }
    catch (err) { console.error(err); }

    return Object.assign({}, this.getDefaultState(), state);
  }

  getDefaultState() {
    return {
      width: this.options.width,
      height: this.options.height,
      minWidth: 300,
      minHeight: 400,
      icon: process.platform !== 'darwin' ? this.getIcon() : null,
    };
  }

  getIcon() {
    return config.getPath('./static/img/icon.', process.platform === 'windows' ? 'ico' : 'png');
  }

  saveState() {
    const state = this.win.getBounds();
    state.isMaximized = this.win.isMaximized();

    this.userDataDir.write(this.filename, state, { atomic: true });
  }

  create() {
    this.state = this.restoreState();
    this.win = new BrowserWindow(this.state);

    if (this.state.isMaximized) {
      this.win.maximize();
    }

    this.win.on('close', this.saveState.bind(this));

    return this.win;
  }
};
