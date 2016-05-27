const electron = require('electron-prebuilt');
const { spawn } = require('child_process');

const gulp = require('gulp');
const livereload = require('gulp-livereload');

const files = {
  electron: './src/electron/**/*',
  app: './src/app/**/*',
  css: './src/static/css/**/*',
  view: './src/view/**/*',
};

gulp.task('watch', function gulpWatch() {
  livereload.listen();
  gulp.watch(files.electron, ['launch']);
  gulp.watch([files.app, files.css, files.view], ['watch:reload']);
});

gulp.task('watch:reload', function gulpWatchReload() {
  gulp.src([files.app, files.css, files.view])
  .pipe(livereload());
});

let child;
gulp.task('launch', function gulpLaunch() {
  if (child) {
    child.kill('SIGUSR1');
  }

  child = spawn(electron, ['./src/electron'], { stdio: 'inherit' })
    .on('close', (code, signal) => { signal !== 'SIGUSR1' && process.exit(); });
});

gulp.task('default', ['watch', 'launch']);
