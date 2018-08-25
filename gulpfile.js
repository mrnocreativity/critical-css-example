'use strict';

var gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	clear = require('clear'),
	del = require('del'),
	compress = require('compression'),
	sass = require('gulp-sass'),
	replace = require('gulp-replace'),
	fileInclude = require('gulp-file-include'),
	rename = require('gulp-rename'),
	util = require('gulp-util'),
	sourcemaps = require('gulp-sourcemaps'),
	postcss = require('gulp-postcss'),
	postcssCriticalSplit = require('postcss-critical-split'),
	browserSync = require('browser-sync').create(),
	renderCritical = false;

if (getArgument('release') !== null) {
	renderCritical = true;
}

clear();

gulp.task('build', ['js', 'css', 'html']);
gulp.task('css', ['css:lint', 'css:sass', 'css:critical', 'css:postcss', 'css:stats']);
gulp.task('css:critical', ['css:critical:split', 'css:critical:render']);
gulp.task('css:update', ['clear', 'css']);
gulp.task('html:update', ['clear', 'html'], browserSync.reload);
gulp.task('default', ['build', 'server', 'watch']);


/*////////////////////////////////////////
//////////////////////////////////////////

				TASKS

///////////////////////////////////////////
/////////////////////////////////////////*/



gulp.task('server', ['build'], function(done) {
	var serverSettings = {
		'port': 13337,
		'ui': {
		'weinre': {
			'port': 8001
			}
		},
		'open': false,
		'middleware': [compress()],
		'server': {
			'baseDir': './build',
			'directory': true
		}
	};

	browserSync.init(serverSettings, done);
});


gulp.task('clear', function(done) {
	clear();
	done();
});

gulp.task('clean', function() {
	return del.sync('./build/**/*', {
		'force': true
	});
});

gulp.task('css:sass', function() {
	return gulp.src('*.scss', {'cwd': './src/sass'})
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css'));
});

gulp.task('css:stream', function() {
	return gulp.src('*.css', {'cwd': './build/css'})
		.pipe(browserSync.stream({'match': '**/*.css'}));
});

gulp.task('css:split', ['css:split:critical', 'css:split:rest']);

gulp.task('css:split:critical', ['css:sass'], function() {
	var splitOptions = getSplitOptions(true);

	return gulp.src(['**/*.css','!**/*'+ splitOptions.suffix +'.css'], {'cwd': './build/css'})
		.pipe(sourcemaps.init({'loadMaps': true}))
		.pipe(postcss([postcssCriticalSplit(splitOptions)]))
		.pipe(rename({'suffix': splitOptions.suffix}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css'));
});

gulp.task('css:split:rest', ['css:sass'], function() {
	var splitOptions = getSplitOptions(false);

	return gulp.src(['**/*.css','!**/*'+ splitOptions.suffix +'.css'], {'cwd': './build/css'})
		.pipe(sourcemaps.init({'loadMaps': true}))
		.pipe(postcss([postcssCriticalSplit(splitOptions)]))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css'));
});



gulp.task('css:critical:render', ['css:split'], function(done) {
	var postcssPlugins = [];

	if(renderCritical) {
		postcssPlugins.push(require('postcss-url')({
			'url': function(url, decl, from, dirname, to, options, result) {
				url = url.replace(/\.\.\//, '');
				return url;
			}
		}));

		return gulp.src('**/*-critical.css', {'cwd': './build/css'})
			.pipe(postcss(postcssPlugins))
			.pipe(gulp.dest('./build/css'));
	} else {
		done();
	}
});

gulp.task('css', ['css:critical:render']);


gulp.task('js', function() {
	return gulp.src('**/*.js', {'cwd': './src/js/'})
		.pipe(gulp.dest('./build/js'));
});

gulp.task('html', ['js', 'css'], function(done) {
	return gulp.src('**/gulp.html', {'cwd': './src/html/'})
		.pipe(replace(/<!--{{critical:(css|js):'(.+)'}}-->/gi, replaceCritical))
		.pipe(renderCritical ? fileInclude({
			'prefix': '@@',
			'basepath': '@root'
		}) : util.noop())
		.pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
	gulp.watch('**/*.html', {'cwd': './src/html'}, ['html:update']);
	gulp.watch('**/*.scss', {'cwd': './src/sass'}, ['css:update']);
	gulp.watch('**/*.css', {'cwd': './build/css'}, ['css:stream']);
});

/*////////////////////////////////////////
//////////////////////////////////////////

				FUNCTIONS

///////////////////////////////////////////
/////////////////////////////////////////*/

function getSplitOptions(isCritical) {
	var options = {
		'start': 'critical:start',
		'stop': 'critical:end',
		'suffix': '-critical'
	};

	if (isCritical === true) {
		options.output = postcssCriticalSplit.output_types.CRITICAL_CSS;
	} else {
		options.output = postcssCriticalSplit.output_types.REST_CSS;
	}

	return options;
}

function replaceCritical(matchedString, type, url){
	var result = matchedString = '',
		absoluteUrl = path.resolve('./build', url);

	if (renderCritical === true) {
		switch(type) {
			case 'css':
				result = '<style type="text/css">' + '@@include(\'' + absoluteUrl + '\') </style>';
				break;
			case 'js':
				result = '<script>' + '@@include(\'' + absoluteUrl + '\') </script>';
				break;
		}
	} else {
		switch(type) {
			case 'css':
				result = '<link rel="stylesheet" href="' + url + '"/>';
				break;
			case 'js':
				result = '<script src="' + url + '"></script>';
				break;
		}
	}

	return result;
}

function getArgument(key) {
	var result = null,
		requestedValue = util.env[key];

	if (typeof requestedValue !== 'undefined') {
		result = requestedValue;
	}

	return  result;
}

