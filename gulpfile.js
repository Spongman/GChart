var gulp = require('gulp');
var util = require('gulp-util');
var ts = require('gulp-typescript');
var watch = require('gulp-watch');
//var browserify = require('browserify');
//var source = require('vinyl-source-stream');
var connect = require('gulp-connect');
//var uglify = require('gulp-uglify');
var uglifyes = require('uglify-es');
var composer = require('gulp-uglify/composer');
var uglify = composer(uglifyes, console);

var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var uglifycss = require('gulp-uglifycss');
var clean = require('gulp-clean');
var connectProxy = require('gulp-api-proxy');

const config = {
	production: !!util.env.production,
};

var tsProject = ts.createProject(
	'./src/tsconfig.json', {
		removeComments: config.production,
		experimentalAsyncFunctions: !config.production,
		//target: config.production ? "es2015" : "es2017"
	}
);

/*
compile typescript
use ES5 and commonJS module
*/
gulp.task('typescript', function () {

	return tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(tsProject()).js
		//.pipe(gulp.dest("dist/js"))
		//.pipe(buffer())
		.pipe(config.production ? uglify() : util.noop())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest("dist"));
});

gulp.task('javascript', function () {

	gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(config.production ? uglify() : util.noop())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));
});
/*
Web server to test app
*/
gulp.task('webserver', ['default'], function () {
	connect.server({
		livereload: true,
		root: 'dist/',
		middleware: function (connect, opt) {
			opt.route = '/finance';
			opt.context = "finance.google.com/finance";
			var proxy = new connectProxy(opt);
			return [proxy];
		}
	});
});
/*
Automatic Live Reload
*/
gulp.task('livereload', function () {

	watch(['dist/*.css', 'dist/*.js', 'dist/*.html'])
		.pipe(connect.reload());
});
/*
copy all html files and assets
*/
gulp.task('html', function () {
	gulp.src('src/**/*.html')
		.pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
	gulp.src('src/**/*.css')
		.pipe(gulp.dest('dist'));
});

gulp.task('assets', function () {
	gulp.src('assets/**/*.*')
		.pipe(gulp.dest('dist'));
});

/*
browserify
now is only for Javascript files
*/
gulp.task('browserify', function () {
	browserify('./dist/js/index.js')
		.bundle()
		.pipe(source('index.js'))
		.pipe(gulp.dest('dist'));
});

/*
Watch typescript, styles, html, etc...
*/
gulp.task('watch', function () {
	gulp.watch('src/**/*.css', ['styles']);
	gulp.watch(['src/**/*.ts', 'src/**/*.tsx'], ['typescript'/*, 'browserify'*/]);
	gulp.watch('src/**/*.js', ['javascript']);
	gulp.watch('src/**/*.html', ['html']);
	gulp.watch('assets/**/*.*', ['assets']);
});

gulp.task('clean', () =>
	gulp.src('./dist', { read: false })
		.pipe(clean())
);

gulp.on('err', function (e) {
	console.log(e.err.stack);
});

/*
default task
*/

gulp.task('default',
	['styles', 'typescript', 'javascript', 'html', 'assets']);

gulp.task('serve',
	['webserver', 'livereload', 'watch']);
