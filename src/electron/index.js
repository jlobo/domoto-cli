const { app, protocol } = require('electron');
const window = require('./window');
const config = require('../app/config');
const url = require('url');

let win;
function createWindow() {
  win = new window('main', {width: 800, height: 600});
  win.loadURL(`file://${config.root}/view/index.html`);

  win.on('closed', () => { win = null; });
}

function intercept(request, callback) {
  let pathname = url.parse(request.url).pathname;
  if (!pathname.includes(config.root)) {
    pathname = config.getPath(pathname);
  }
  callback(pathname);
}

function configureOnReady() {
  protocol.interceptFileProtocol('file', intercept);
  createWindow();
}

app.on('ready', configureOnReady);

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
