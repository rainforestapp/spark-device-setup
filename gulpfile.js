const gulp = require('gulp');
const connect = require('gulp-connect');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

gulp.task('connect', () => {
	connect.server({
		root: [ 'public' ],
		port: 8080,
		base: 'http://127.0.0.1/',
		livereload: true,
	});
});

gulp.task('html', () => {
	gulp.src('./src/*.html')
		.pipe(gulp.dest('./public'))
		.pipe(connect.reload());
});

gulp.task('js', () => {
	browserify('./src/index.js')
		.transform(babelify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('DeviceSetup.js'))
		.pipe(gulp.dest(__dirname + '/public/js'))
		.pipe(connect.reload());
});

gulp.task('watch', () => {
	gulp.watch('./src/*.js', [ 'js' ]);
	gulp.watch('./src/*.html', [ 'html' ]);
});

gulp.task('default', [ 'js', 'html' ]);
