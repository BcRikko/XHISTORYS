var gulp = require('gulp');

var ts = require('gulp-typescript');
var tsConfig = require('./src/ts/tsconfig.json');
var tsTestConfig = require('./src/test/tsconfig.json');

var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');

var webserver = require('gulp-webserver');

// メイン（TypeScript）
gulp.task('ts', function () {
    var tsResult = gulp.src(['./src/ts/**/*.ts', '!./src/typings'])
        .pipe(ts(tsConfig.compilerOptions));
    
    return tsResult.pipe(gulp.dest('./dist/js'));
});
// メイン（HTML）
gulp.task('html', function () { 
    return gulp.src(['./src/html/**/*.html', './src/html/**/*.css']).pipe(gulp.dest('./dist/html'));
});


// manifest
gulp.task('manifest', function () { 
    return gulp.src('./src/manifest.json').pipe(gulp.dest('./dist'));
});

// icons
gulp.task('icons', function () { 
    return gulp.src('./src/icons/*').pipe(gulp.dest('./dist/icons'));
});

// bower
gulp.task('bower', function () { 
    return gulp.start(['bower-front', 'bower-back']);
});

gulp.task('bower-front', function () {
    return gulp.src(['./bower_components/bootstrap/dist/**', './bower_components/vue/dist/vue.min.js'])
        .pipe(gulp.dest('./dist/html/libs'));
});

gulp.task('bower-back', function () { 
    return gulp.src(['./bower_components/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('./dist/js/libs'));
});

// テスト用
gulp.task('tsTest', function () {
    var tsResult = gulp.src(['./src/test/**/*.ts'])
        .pipe(ts(tsTestConfig.compilerOptions));

    return tsResult.pipe(gulp.dest('./dist/test'));
});
gulp.task('htmlTest', function () { 
    return gulp.src('./src/test/**/*.html').pipe(gulp.dest('./dist/test'));
});

// 自動更新用
gulp.task('webserver', function () {
    gulp.src('./dist')
        .pipe(
        webserver({
            host: 'localhost',
            livereload: true
        })
    )
});

// ウォッチ
gulp.task('watch', function () {
    gulp.watch('./src/**/*.ts', ['ts']);
    gulp.watch(['./src/**/*.html', './src/**/*.css'], ['html']);
    gulp.watch('./src/**/*.ts', ['tsTest']);
    gulp.watch('./src/manifest.json', ['manifest']);
});


gulp.task('build', ['ts', 'html', 'bower', 'manifest', 'icons']);
gulp.task('test', ['tsTest', 'htmlTest']);
gulp.task('default', ['ts', 'html', 'watch', 'webserver']);