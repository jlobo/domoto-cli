'use strict';

const { server } = require('electron-connect');
const gulp = require('gulp');

const files = {
  electron: './src/electron/**/*',
  app: './src/app/**/*',
  css: './src/static/css/**/*',
  view: './src/view/**/*',
};

gulp.task('watch', function gulpWatch() {
  const connect = server.create({ path: './src/electron' });
  connect.start();
  gulp.watch(files.electron, connect.restart);
  gulp.watch([files.app, files.css, files.view], connect.reload);
});

gulp.task('default', ['watch']);
