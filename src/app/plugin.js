const q = require('q');
const npm = require('npm');
const jetpack = require('fs-jetpack');
const EventEmitter = require('events');
const { app } = require('electron').remote;

const singleton = Symbol();
const singletonEnforcer = Symbol();

module.exports = class Plugin extends EventEmitter {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot construct singleton');

    super();

    this.isLoad = false;
    this.userDataDir = jetpack.cwd(app.getPath('userData'));

    this._setLoaded = this._setLoaded.bind(this);
    this._saveChange = this._saveChange.bind(this);
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new Plugin(singletonEnforcer);

    return this[singleton];
  }

  install(...packages) {
    this._loadNpm()
      .thenResolve(packages)
      .then(this._installNpm)
      .spread(this._saveChange)
      .then(data => this.emit('add', data))
      .fail(err => this.emit('error', err));
  }

  get list() {
    if (this._list)
      return this._list;

    try {
      return (this._list = this.userDataDir.read('plugin.json', 'json') || {});
    }
    catch (err) { console.error(err); }

    return (this._list = {});
  }

  _saveList() {
    this.userDataDir.write('plugin.json', this.list, { atomic: true });
  }

  _loadNpm() {
    return this.isLoad
      ? q.resolve()
      : q.nfcall(npm.load).then(this._setLoaded);
  }

  _setLoaded() {
    this.isLoad = true;
    npm.on('log', console.log);
  }

  _installNpm(packages) {
    return q.all([q.nfapply(npm.commands.install, packages),
      q.nfapply(npm.commands.info, packages.concat('version'))]);
  }

  _saveChange(installs, info) {
    const version = Object.keys(info)[0];
    const name = info[version].name;

    this.list[name] = version;
    this._saveList();

    return ({ name: name, version: version });
  }
};
