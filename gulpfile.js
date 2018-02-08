const gulp = require('gulp');
const util = require('gulp-util');
const ts = require('gulp-typescript');
const watch = require('gulp-watch');
//const browserify = require('browserify');
//const source = require('vinyl-source-stream');
const connect = require('gulp-connect');
//const uglify = require('gulp-uglify');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);

const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const uglifycss = require('gulp-uglifycss');
const clean = require('gulp-clean');
const connectProxy = require('gulp-api-proxy');
const gulpTslint = require("gulp-tslint");
const tslint = require("tslint");

const config = {
	production: !!util.env.production,
	port: util.env.port,
};

const tsProject = ts.createProject(
	'./src/tsconfig.json', {
		removeComments: config.production,
		experimentalAsyncFunctions: !config.production,
		//target: config.production ? "es2015" : "es2017"
	}
);

const uglifyOptions = {
	keep_fnames: true
};

/*
compile typescript
use ES5 and commonJS module
*/
gulp.task('typescript', () =>

	tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(tsProject()).js
		//.pipe(gulp.dest("dist/js"))
		//.pipe(buffer())
		.pipe(config.production ? uglify(uglifyOptions) : util.noop())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest("dist"))
);

gulp.task("tslint", ['typescript'], () => {

	var program = tslint.Linter.createProgram("./src/tsconfig.json");

	return gulp.src('./src/**/*.ts', { base: './src' })
		.pipe(gulpTslint({ program, formatter: "verbose" }))
		.pipe(gulpTslint.report());
		
	/*
	tsProject.src()
		//gulp.src("source.ts")
		.pipe(tslint({
			formatter: "verbose"
		}))
	//.pipe(tslint.report())
	*/
});

gulp.task('javascript', () =>

	gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(config.production ? uglify(uglifyOptions) : util.noop())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
);

/*
Web server to test app
*/
gulp.task('webserver', ['watch'], () =>
	connect.server({
		livereload: true,
		root: 'dist/',
		port: config.port || 8080,
		middleware: function (connect, opt) {
			opt.route = '/finance';
			opt.context = "finance.google.com/finance";
			var proxy = new connectProxy(opt);
			return [proxy];
		}
	})
);

/*
Automatic Live Reload
*/
gulp.task('livereload', ['webserver'], () =>

	watch(['dist/*.css', 'dist/*.js', 'dist/*.html'])
		.pipe(connect.reload())
);

/*
copy all html files and assets
*/
gulp.task('html', () =>
	gulp.src('src/**/*.html')
		.pipe(gulp.dest('dist'))
);

gulp.task('styles', () =>
	gulp.src('src/**/*.css')
		.pipe(gulp.dest('dist'))
);

gulp.task('assets', () =>
	gulp.src('assets/**/*.*')
		.pipe(gulp.dest('dist'))
);

/*
browserify
now is only for Javascript files
*/
gulp.task('browserify', () =>
	browserify('./dist/js/index.js')
		.bundle()
		.pipe(source('index.js'))
		.pipe(gulp.dest('dist'))
);

/*
Watch typescript, styles, html, etc...
*/
gulp.task('watch', ['default'], () => {
	gulp.watch('src/**/*.css', ['styles']);
	gulp.watch(['src/**/*.ts', 'src/**/*.tsx'], ['typescript']);
	gulp.watch('src/**/*.js', ['javascript']);
	gulp.watch('src/**/*.html', ['html']);
	gulp.watch('assets/**/*.*', ['assets']);
});

gulp.task('clean', () =>
	gulp.src('./dist', { read: false })
		.pipe(clean())
);

gulp.on('err', e => {
	console.log(e.err.stack);
});

/*
default task
*/

gulp.task('default',
	['styles', 'typescript', 'javascript', 'html', 'assets']);

gulp.task('serve',
	['livereload']);
