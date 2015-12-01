'use strict';

let babelify = require('babelify'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify'),
    webserver = require('gulp-webserver');

let buildDirectory = 'build';

gulp.task('default', ['clean'], function() {
  return gulp.start('build');
});

gulp.task('clean', function() {
  return del(buildDirectory);
});

gulp.task('build', ['scripts:prod', 'css:prod']);

gulp.task('dev', ['webserver', 'watch'], function() {
  livereload({ start: true });
});

gulp.task('webserver', ['scripts:dev', 'css:dev'], function() {
  gulp.src('.')
  .pipe(webserver({
    path: '/',
    fallback: 'index.html',
    livereload: {
      enable: true
    },
    port: 8080
  }));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.scss', ['css:dev']);
  gulp.watch('build/*.css', livereload.reload);
});

gulp.task('scripts:prod', function() {
  return browserifyScript(false);
});

gulp.task('scripts:dev', function() {
  return browserifyScript(true);
});

gulp.task('css:prod', function() {
  return css(false);
});

gulp.task('css:dev', function() {
  return css(true);
});

function browserifyScript(dev) {
  let bundler = browserify({
    cache: {},
    debug: dev,
    entries: 'src/js/app.jsx',
    extensions: ['.js', '.jsx'],
    fullPaths: dev,
    packageCache: {},
    transform: [babelify]
  });
  
  let rebundle = function(file) {
    gutil.log(gutil.colors.white('Browserify '), gutil.colors.magenta(file ? file : ''));
    return bundler.bundle()
      .on('error', function(err) {
        gutil.log(gutil.colors.red(err.message));
        this.emit('end');
      })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: dev}))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(buildDirectory))
  };

  if (dev) {
    bundler = watchify(bundler);
    bundler.on('update', rebundle);
    bundler.on('log', function (msg) {
      gutil.log(gutil.colors.white("Browserify done! " + msg));
      livereload.reload();
    });
  }
  return rebundle();
};

function css(dev) {
  return gulp.src('src/scss/app.scss')
    .pipe(sourcemaps.init({loadMaps: dev}))
    .pipe(plumber({
      errorHandler: function(err) {
          gutil.log(gutil.colors.red(err.message));
          this.emit('end');
        }
    }))
    .pipe(sass({
      includePaths: ['src/scss', 'node_modules']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(buildDirectory))
}
