var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
// var babel = require('gulp-babel');
// var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
// var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var del = require('del');

var paths = {
  htmls: {
    src: './public/**/*.html',
    dest: './public',
    options: {
      removeComments: true,	//清除 HTML 注释
      collapseWhitespace: true,	//压缩 HTML
      collapseBooleanAttributes: false,	//省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: false,	//删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true,	//删除 <script> 的 type="text/javascript"
      removeStyleLinkTypeAttributes: true,	//删除 <style> 和 <link> 的 type="text/css"
      minifyJS: true,	//压缩页面 JS
      minifyCSS: true	//压缩页面 CSS
    }
  },
  styles: {
    src: './public/**/*.less',
    dest: './public'
  },
  scripts: {
    src: './public/**/*.js',
    dest: './public'
  }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(['assets']);
}

function htmls() {
  return gulp.src(paths.htmls.src)
    .pipe(htmlmin(paths.htmls.options))
    .pipe(gulp.dest(paths.htmls.dest));
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(less())
    .pipe(cleanCSS())
    // pass in options to the stream
    // .pipe(rename({
    //   basename: 'main',
    //   suffix: '.min'
    // }))
    .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    // .pipe(babel())
    .pipe(uglify())
    // .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(clean, gulp.parallel(htmls, styles, scripts));

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;