const q = require('q');
const npm = require('npm');
const jetpack = require('fs-jetpack');
const EventEmitter = require('events');
const { app } = require('electron').remote;
const InstallError = require('./installError');

const singleton = Symbol();
const singletonEnforcer = Symbol();

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
    this._loadNpm()
      .thenResolve(extension)
      .then(data => this._verifyinstallation(data))
      .then(this._installNpm)
      .spread((installs, info) => this._saveInstall(installs, info))
      .then(data => this.emit('installed', data))
      .fail(err => this.emit('error', err));
  }

  remove(extension) {
    this._loadNpm()
      .thenResolve(extension)
      .then(this._removeNpm)
      .thenResolve(extension)
      .then(data => this._saveRemove(data))
      .then(data => this.emit('removed', data))
      .fail(err => this.emit('error', err));
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

  _verifyinstallation(extension) {
    if (Object.keys(this.list).includes(extension))
      throw new InstallError('La extensión ya se encuentra instalada');

    return extension;
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
    return q.nfcall(npm.commands.remove, [extension]);
  }

  _installNpm(extension) {
    return q.all([q.nfcall(npm.commands.install, [extension]),
      q.nfcall(npm.commands.info, [extension, 'name', 'version']).get(0)]);
  }

  _saveInstall(installs, info) {
    const extension = info[Object.keys(info)[0]];

    this.list[extension.name] = extension.version;
    this._saveList();

    return (extension);
  }

  _saveRemove(extension) {
    delete this.list[extension];
    this._saveList();

    return { name: extension};
  }
};
