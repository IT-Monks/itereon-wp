'use strict';

/**************** gulpfile.js configuration ****************/

const

	// directory locations
	dir = {
		nm: '../../../node_modules/',
		theme: '.',
		src: 'assets/src/',
		build: 'assets/dist/'
	},
	url = 'http://wp.test',

	// modules
	gulp = require( 'gulp' ),
	newer = require( 'gulp-newer' ),
	size = require( 'gulp-size' ),
	imagemin = require( 'gulp-imagemin' ),
	sass = require( 'gulp-sass' ),
	babel = require('gulp-babel'),
	postcss = require( 'gulp-postcss' ),
	sassGlob = require( 'gulp-sass-glob' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	rename = require( 'gulp-rename' ),
	jshint = require( 'gulp-jshint' ),
	uglify = require( 'gulp-uglify' ),
	concat = require( 'gulp-concat' ),
	plumber = require( 'gulp-plumber' ),
	criticalCss = require('gulp-penthouse'),
	sassLint = require('gulp-sass-lint'),
	replace = require('gulp-replace'),
	browsersync = require( 'browser-sync' ).create();

// Default error handler
const onError = function( err ) {
	console.log( 'An error occured:', err.message );
	this.emit( 'end' );
};

/**************** textdomain task ****************/

function textdomain() {

	return gulp.src( './**/*', {ignore: 'gulpfile.js'} )
		.pipe(replace('s_itereon2', 's_itereon'))
		.pipe( gulp.dest('./') );

}

/**************** images task ****************/

const imgConfig = {
	src: dir.src + 'img/**/*',
	build: dir.build + 'img/',
	minOpts: {
		optimizationLevel: 5
	}
};

function images() {

	return gulp.src( imgConfig.src )
		.pipe( newer( imgConfig.build ) )
		.pipe( imagemin( imgConfig.minOpts ) )
		.pipe( size( {showFiles: true} ) )
		.pipe( gulp.dest( imgConfig.build ) );

}

/**************** CSS task ****************/

const cssConfig = {

	src: [dir.src + 'scss/main.scss', dir.src + 'scss/login.scss'],
	lint: dir.src + 'scss/**/*.s+(a|c)ss',
	lintTest: dir.src + 'scss/login.scss',
	watch: dir.src + 'scss/**/*',
	build: dir.build + 'css/',
	main: dir.build + 'css/main.min.css',
	sassOpts: {
		sourceMap: true,
		outputStyle: 'nested',
		imagePath: '/img/',
		precision: 3,
		errLogToConsole: true,
		includePaths: [
			dir.nm
		]
	},

	postCSS: [
		require( 'autoprefixer' )( {
			browsers: ['> 1%']
		} ),
		require( 'cssnano' )
	]

};

function cssLint() {
	return gulp.src( cssConfig.lintTest )
		.pipe( sassLint( {
			configFile: '.sass-lint.yml'
		} ) )
		.pipe( sassLint.format() )
		.pipe( sassLint.failOnError() )
}

function css() {

	return gulp.src( cssConfig.src )
		.pipe( plumber() )
		.pipe( sourcemaps.init() )
		.pipe( sassGlob() )
		.pipe( sass( cssConfig.sassOpts ).on( 'error', sass.logError ) )
		.pipe( postcss( cssConfig.postCSS ) )
		.pipe( sourcemaps.write() )
		.pipe( size( {showFiles: true} ) )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( gulp.dest( cssConfig.build ) )
		.pipe( browsersync.reload( {stream: true} ) );
}

function critCss() {
	return gulp.src( cssConfig.main )
		.pipe(criticalCss({
			out: '/critical.php', // output file name
			url: url, // url from where we want penthouse to extract critical styles
			width: 1400, // max window width for critical media queries
			height: 900, // max window height for critical media queries
			userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' // pretend to be googlebot when grabbing critical page styles.
		}))
		.pipe(gulp.dest(dir.theme)); // destination folder for the output file
}

/**************** JS task ****************/

const jsConfig = {

	src: [dir.src + 'js/libs/*.js', dir.src + 'js/custom/*.js'],
	srcLibs: dir.src + 'js/libs/*.js',
	lintSrc: dir.src + 'js/custom/*.js',
	watch: dir.src + 'js/**/*',
	build: dir.build + 'js/'

};
// Jshint outputs any kind of javascript problems you might have
// Only checks javascript files inside /src directory
function jsHint() {
	return gulp.src( jsConfig.lintSrc )
		.pipe( jshint( '.jshintrc' ) )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( jshint.reporter( 'fail' ) );
}

function js() {
	return gulp.src( jsConfig.src )
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe( concat( 'app.js' ) )
		.pipe( gulp.dest( jsConfig.build ) )
		.pipe( uglify() )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( jsConfig.build ) )
		.pipe( browsersync.reload({stream: true}) );
}

/**************** browser-sync task ****************/

const syncConfig = {
	proxy: {
		target: url
	},
	port: 8000,
	files: [
		'./**/*.php'
	],
	open: false
};

// browser-sync
function bs() {
	return browsersync.init( syncConfig );
}

/**************** watch task ****************/

function watchjs() {
	gulp.watch(jsConfig.watch, jsHint);
	gulp.watch(jsConfig.watch, js);
}

function watchcss() {
	gulp.watch(cssConfig.watch, css);
}

var start = gulp.parallel(css, js, bs, watchcss, watchjs);

exports.cssLint = cssLint;
exports.css = css;
exports.critCss = critCss;
exports.images = images;
exports.jsHint = jsHint;
exports.js = js;
exports.bs = bs;
exports.watchjs = watchjs;
exports.watchcss = watchcss;
exports.textdomain = textdomain;

exports.default = start;