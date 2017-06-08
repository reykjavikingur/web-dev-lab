let gulp = require('gulp');

gulp.task('default', ['start']);

gulp.task('clean', [], (cb) => {
    let rimraf = require('rimraf');
    rimraf('dist', cb);
});

gulp.task('start', ['serve']);

gulp.task('create', ['create:pages', 'create:static', 'create:styles', 'create:scripts']);

gulp.task('watch', ['watch:pages', 'watch:static', 'watch:styles', 'watch:scripts']);

gulp.task('serve', ['watch'], (cb) => {
    let browserSync = require('browser-sync');
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        files: 'dist/**/*'
    }, cb);
});

let pages = 'src/pages/**/*.html';

gulp.task('create:pages', [], () => {
    return gulp.src(pages)
        .pipe(gulp.dest('dist'))
        ;
});

gulp.task('watch:pages', ['create:pages'], () => {
    gulp.watch(pages, ['create:pages']);
});

let staticFiles = 'src/static/**/*';

gulp.task('create:static', [], () => {
    return gulp.src(staticFiles)
        .pipe(gulp.dest('dist/assets'))
        ;
});

gulp.task('watch:static', ['create:static'], () => {
    gulp.watch(staticFiles, ['create:static']);
});

let styles = 'src/styles/**/*.scss';

gulp.task('create:styles', [], () => {
    let sass = require('gulp-sass');
    let sourcemaps = require('gulp-sourcemaps');

    return gulp.src(styles)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded' // valid values: nested, expanded, compact, compressed
        }).on('error', handleError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets/styles'))
        ;

    function handleError(err) {
        sass.logError.call(this, err);
        this.emit('end');
    }
});

gulp.task('watch:styles', ['create:styles'], () => {
    gulp.watch(styles, ['create:styles']);
});

gulp.task('create:scripts', [], () => {
    let browserify = require('browserify');
    let sourcemaps = require('gulp-sourcemaps');
    let source = require('vinyl-source-stream');
    let buffer = require('vinyl-buffer');

    return browserify('src/scripts/main.js', {
        debug: true
    })
        .transform('babelify') // uses .babelrc
        .bundle()
        .on('error', handleError)
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // do any further script optimization here
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets/scripts'))
        ;

    function handleError(err) {
        console.error(err.toString());
        this.emit('end');
    }
});

gulp.task('watch:scripts', ['create:scripts'], () => {
    gulp.watch([
        'src/scripts/**/*',
        'package.json'
    ], [
        'create:scripts'
    ]);
});
