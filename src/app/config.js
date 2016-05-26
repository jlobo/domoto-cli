'use strict';

let path = require('path')

var Config = function Config() {
  this.env = process.env.NODE_ENV || 'development';
  this.isDevelopment = this.env == 'development';
  this.root = path.normalize(__dirname + '/..');
};

module.exports = new Config();