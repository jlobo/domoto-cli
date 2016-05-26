var childProcess = require('child_process');
var electron = require('electron-prebuilt');

var gulp = require('gulp');
var debug = require('gulp-debug');
var livereload = require('gulp-livereload');

var srcFiles = ['./src/app/**/*', './src/electron/**/*', './src/static/css/**/*', './src/view/**/*'];

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(srcFiles, ['watch:reload']);
});

gulp.task('watch:reload', function() {
    gulp.src(srcFiles)
    .pipe(debug())
    .pipe(livereload());
});

gulp.task('develop', ['watch'], function () {
    childProcess.spawn(electron, ['./src/electron'], { stdio: 'inherit' })
    .on('close', () => { process.exit(); } );
});

gulp.task('default', ['develop']);