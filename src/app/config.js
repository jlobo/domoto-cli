const path = require('path');

module.exports = new (class config {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.env === 'development';
    this.root = path.resolve(__dirname, '..');
  }

  getPath(...paths) {
    return path.join(this.root, paths.join(''));
  }
})();
