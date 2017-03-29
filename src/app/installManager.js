//TODO: rename this class name, it's very confusing
let npm = null;
const q = require('q');
const Wait = require('./wait');
const jetpack = require('fs-jetpack');
const EventEmitter = require('events');
const { app } = require('electron').remote;
const InstallError = require('./installError');

const singleton = Symbol();
const singletonEnforcer = Symbol();
const extensionKey = Symbol('instance');

module.exports = class InstallManager extends EventEmitter {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    super();
    this._wait = Wait.instance;
    this.userDataDir = jetpack.cwd(app.getPath('userData'));
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new InstallManager(singletonEnforcer);

    return this[singleton];
  }

  install(name) {
    this._verifyInput(name);
    this._wait.waiting();

    this._loadNpm()
      .thenResolve(name)
      .then(data => this._verifyInstallation(data))
      .then(this._installNpm)
      .spread((installs, info) => this._saveInstall(installs, info))
      .then(data => this.emit('installed', data))
      .fail(err => this.emit('error', err, name))
      .fin(this._wait.waited);
  }

  remove(name) {
    this._verifyInput(name);
    this._wait.waiting();

    this._loadNpm()
      .thenResolve(name)
      .then(this._removeNpm)
      .thenResolve(name)
      .then(data => this._saveRemove(data))
      .then(data => this.emit('removed', data))
      .fail(err => this.emit('error', err, name))
      .fin(this._wait.waited);
  }

  * getExtensions() {
    const names = Object.keys(this.installed);
    for (const name of names)
      yield this.require(name);
  }

  get installed() {
    if (this._installed)
      return this._installed;

    try {
      return (this._installed = this.userDataDir.read('extension.json', 'json') || {});
    }
    catch (err) { console.error(err); }

    return (this._installed = {});
  }

  require(name) {
    const extension = this.installed[name];
    if (!extension)
      return null;

    try {
      return extension[extensionKey] || (extension[extensionKey] = new (require(name))());
    }
    catch (err) {
      console.error(err);
      this.emit('require-error', err, extension.name);
      return null;
    }
  }

  _verifyInput(name) {
    if (!name)
      throw new TypeError('Extension name is required');
  }

  _loadNpm() {
    this._setNpm();

    return q.nfcall(npm.load, {'save-optional': true })
      .then(() => npm.on('log', console.log));
  }

  // HACK: Cuando se reinstala un paquete, no instala las dependencias y por eso se limpia la cache
  _setNpm() {
    const files = Object.keys(require.cache);
    const npmFiles = files.filter(file => file.indexOf('npm') !== -1 && file.indexOf('npm/node_modules') === -1);

    for (const file of npmFiles)
      delete require.cache[file];

    npm = require('npm');
  }

  _verifyInstallation(extensionName) {
    return q.fcall(() => this._verifyDuplicateInstallation(extensionName))
      .thenResolve([extensionName, 'name', 'keywords'])
      .then(q.denodeify(npm.commands.info))
      .get(0)
      .then(this._verifyDomotoInstallation)
      .thenResolve(extensionName);
  }

  _verifyDomotoInstallation(info) {
    info = info[Object.keys(info)[0]];
    if (!info.keywords || !info.keywords.includes('domoto-extension'))
      throw new InstallError('Sorry, the extension is not valid for Domoto');
  }

  _verifyDuplicateInstallation(name) {
    if (!Object.keys(this.installed).includes(name))
      return name;

    throw new InstallError('The extension is already installed');
  }

  _removeNpm(extensionName) {
    return q.nfcall(npm.commands.uninstall, [extensionName]);
  }

  _installNpm(extensionName) {
    return q.all([q.nfcall(npm.commands.install, [extensionName]),
      q.nfcall(npm.commands.info, [extensionName, 'name', 'version']).get(0)]);
  }

  _saveInstall(installs, info) {
    info = info[Object.keys(info)[0]];

    this.installed[info.name] = info;
    this._saveList();

    return (this.require(info.name));
  }

  _saveRemove(name) {
    const extension = this.require(name);
    delete this.installed[name];
    this._saveList();

    return extension;
  }

  _saveList() {
    this.userDataDir.write('extension.json', this.installed, { atomic: true });
  }
};
