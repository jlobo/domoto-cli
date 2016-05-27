const path = require('path');

const Config = function Config() {
  this.env = process.env.NODE_ENV || 'development';
  this.isDevelopment = this.env === 'development';
  this.root = path.resolve(__dirname, '/..');
};

module.exports = new Config();
