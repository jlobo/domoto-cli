const url = require('url');
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

  get isWindows() {
    return (/^win/).test(process.platform);
  }

  getPath(...paths) {
    return path.join(this.source, paths.join(''));
  }

  normalizeUrlPath(urlPath) {
    return !this.isWindows || !(/^[a-zA-Z]:\\/).test(urlPath) ? urlPath : urlPath.substr(2);
  }

  getUrlPath(request) {
    const pathname = path.normalize(url.parse(request.url).pathname);

    return !this.isWindows || !(/^\\[a-zA-Z]:\\/).test(pathname) ? pathname : pathname.substr(1);
  }
})();
