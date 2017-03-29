const path = require('path');

module.exports = new (class config {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.env === 'development';
    this.root = path.resolve(__dirname, '../..');
    this.source = path.resolve(__dirname, '..');
  }

  //TODO: Mover el código de resolver path a una clase en especial
  getExtensionPath(...paths) {
    return path.join(this.root, 'node_modules', paths.join(''));
  }

  getPath(...paths) {
    return path.join(this.source, paths.join(''));
  }
})();
