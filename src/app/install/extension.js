const q = require('q');
const npm = require('npm');
const jetpack = require('fs-jetpack');
const EventEmitter = require('events');
const { app } = require('electron').remote;
const InstallError = require('./installError');

const singleton = Symbol();
const singletonEnforcer = Symbol();
const instanceKey = Symbol('instance');

module.exports = class Extension extends EventEmitter {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    super();

    this.isLoad = false;
    this.userDataDir = jetpack.cwd(app.getPath('userData'));
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new Extension(singletonEnforcer);

    return this[singleton];
  }

  install(extension) {
    this._verifyInput(extension);

    this._loadNpm()
      .thenResolve(extension)
      .then(data => this._verifyInstallation(data))
      .then(this._installNpm)
      .spread((installs, info) => this._saveInstall(installs, info))
      .then(data => this.emit('installed', data))
      .fail(err => this.emit('error', err, extension));
  }

  remove(extension) {
    this._verifyInput(extension);

    this._loadNpm()
      .thenResolve(extension)
      .then(this._removeNpm)
      .thenResolve(extension)
      .then(data => this._saveRemove(data))
      .then(data => this.emit('removed', data))
      .fail(err => this.emit('error', err, extension));
  }

  * getInstances() {
    const extensions = Object.keys(this.list);
    for (const extension of extensions)
      yield this.require(extension);
  }

  get list() {
    if (this._list)
      return this._list;

    try {
      return (this._list = this.userDataDir.read('extension.json', 'json') || {});
    }
    catch (err) { console.error(err); }

    return (this._list = {});
  }

  require(name) {
    const extension = this.list[name];
    if (!extension)
      return null;

    return extension[instanceKey] || (extension[instanceKey] = new (require(name))());
  }

  _verifyInput(extension) {
    if (!extension)
      throw new TypeError('La extensión es requerida');
  }

  _verifyInstallation(extension) {
    return q.fcall(() => this._verifyDuplicateInstallation(extension))
      .thenResolve([extension, 'name', 'keywords'])
      .then(q.denodeify(npm.commands.info))
      .get(0)
      .then(this._verifyDomotoInstallation)
      .thenResolve(extension);
  }

  _verifyDomotoInstallation(info) {
    info = info[Object.keys(info)[0]];
    if (!info.keywords || !info.keywords.includes('domoto'))
      throw new InstallError('Lo sentimos, la extensión no es valida para Domoto');
  }

  _verifyDuplicateInstallation(extension) {
    if (!Object.keys(this.list).includes(extension))
      return extension;

    throw new InstallError('La extensión ya se encuentra instalada');
  }

  _saveList() {
    this.userDataDir.write('extension.json', this.list, { atomic: true });
  }

  _loadNpm() {
    return this.isLoad
      ? q.resolve()
      : q.nfcall(npm.load).then(data => this._setLoaded(data));
  }

  _setLoaded() {
    this.isLoad = true;
    npm.on('log', console.log);
  }

  _removeNpm(extension) {
    // Agregar --save-optional a la instalación
    return q.nfcall(npm.commands.remove, [extension]);
  }

  _installNpm(extension) {
    return q.all([q.nfcall(npm.commands.install, [extension]),
      q.nfcall(npm.commands.info, [extension, 'name', 'version']).get(0)]);
  }

  _saveInstall(installs, info) {
    info = info[Object.keys(info)[0]];

    this.list[info.name] = info;
    this._saveList();

    return (this.require(info.name));
  }

  _saveRemove(name) {
    const extension = this.require(name);
    delete this.list[name];
    this._saveList();

    return extension;
  }
};
