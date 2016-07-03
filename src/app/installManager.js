const q = require('q');
const npm = require('npm');
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

    this.isLoad = false;
    this.userDataDir = jetpack.cwd(app.getPath('userData'));
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new InstallManager(singletonEnforcer);

    return this[singleton];
  }

  install(name) {
    this._verifyInput(name);

    this._loadNpm()
      .thenResolve(name)
      .then(data => this._verifyInstallation(data))
      .then(this._installNpm)
      .spread((installs, info) => this._saveInstall(installs, info))
      .then(data => this.emit('installed', data))
      .fail(err => this.emit('error', err, name));
  }

  remove(name) {
    this._verifyInput(name);

    this._loadNpm()
      .thenResolve(name)
      .then(this._removeNpm)
      .thenResolve(name)
      .then(data => this._saveRemove(data))
      .then(data => this.emit('removed', data))
      .fail(err => this.emit('error', err, name));
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

    return extension[extensionKey] || (extension[extensionKey] = new (require(name))());
  }

  _verifyInput(name) {
    if (!name)
      throw new TypeError('El nombre de la extensión es requerida');
  }

  _loadNpm() {
    return this.isLoad
      ? q.resolve()
      : q.nfcall(npm.load, {'save-optional': true}).then(data => this._setLoaded(data));
  }

  _setLoaded() {
    this.isLoad = true;
    npm.on('log', console.log);
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
      throw new InstallError('Lo sentimos, la extensión no es valida para Domoto');
  }

  _verifyDuplicateInstallation(name) {
    if (!Object.keys(this.installed).includes(name))
      return name;

    throw new InstallError('La extensión ya se encuentra instalada');
  }

  _removeNpm(extensionName) {
    return q.nfcall(npm.commands.remove, [extensionName]);
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
