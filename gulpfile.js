'use strict';

var childProcess = require('child_process');
var electron = require('electron-prebuilt');
var { server } = require('electron-connect');

var gulp = require('gulp');
var debug = require('gulp-debug');

var files = {
    electron: './src/electron/**/*',
    app: './src/app/**/*',
    css: './src/static/css/**/*',
    view: './src/view/**/*'
};

gulp.task('watch', function () {
    let connect = server.create({ path: './src/electron' });
    connect.start();

    gulp.watch(files.electron, connect.restart);
    gulp.watch([ files.app, files.css, files.view ], connect.reload);
});

gulp.task('default', ['watch']);