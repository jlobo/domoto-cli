const npm = require('npm');
const q = require('q');

module.exports = class InstallModule {
  constructor() {
    this.isLoad = false;
  }

  _logNpm(message) {
    console.log(message);
  }

  _initNpm(packages) {
    if (this.isLoad) {
      return q.resolve(packages);
    }

    const defer = q.defer();
    npm.load(err => {
      this.isLoad = false;
      console.log(err);

      if (err) {
        console.error(err);
        return defer.reject(err);
      }

      this.isLoad = true;
      npm.on('log', message => this._logNpm(message));
      return defer.resolve(packages);
    });

    return defer.promise;
  }

  _installNpm(packages) {
    const defer = q.defer();
    npm.commands.install(packages, (err, data) => {
      if (err) {
        console.error(err);
        return defer.reject(err);
      }

      return defer.resolve(data);
    });

    return defer.promise;
  }

  install(...packages) {
    return this._initNpm(packages).then(this._installNpm);
  }
};
