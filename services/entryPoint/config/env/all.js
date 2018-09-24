'use strict';

module.exports = {
	app: {
		title: 'GoHealthNow', //'GlucoGuide',
		description: 'GlucoGuide Application Server',
		// TODO: add more key words
		keywords: 'GlucoGuide,'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null,
		// To set the cookie in a specific domain uncomment the following
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-chart.js/dist/angular-chart.css',
				'public/lib/flexslider/flexslider.css',
				'public/lib/isteven-angular-multiselect/isteven-multi-select.css',
				// 'public/lib/angular-bootstrap/ui-bootstrap-csp.css',
			],
			js: [
				'public/lib/jquery/dist/jquery.js',
				'public/lib/flexslider/jquery.flexslider.js',

				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				// 'public/lib/angular-bootstrap/ui-bootstrap.js',
				'public/lib/ng-file-upload/ng-file-upload.js',
				'public/lib/ng-file-upload-shim/ng-file-upload-shim.js',
				'public/lib/Chart.js/Chart.js',
				'public/lib/angular-chart.js/dist/angular-chart.js',
				// 'public/lib/angular-flexslider/angular-flexslider.js',
				'public/lib/highcharts-ng/dist/highcharts-ng.js',


				//'public/lib/angular-flexslider/angular-flexslider.js',

				//'//code.highcharts.com/adapters/standalone-framework.js',
				//'//code.highcharts.com/highcharts.src.js',
				//'//code.highcharts.com/modules/data.js',
				'public/highcharts/js/highcharts.src.js',
				'public/highcharts/js/modules/data.js',
				'public/highcharts/js/themes/dark-unica.js',//dark-unica.js dark-blue.js
				'public/highcharts/js/modules/exporting.js',
				//'//code.highcharts.com/themes/gray.js', //sand-signika.js',


				//				'/public/highcharts/js/highcharts.src.js',
				//'/public/highcharts/js/themes/dark-blue.js',
				//'/public/highcharts/js/modules/exporting.js'
				'public/lib/clipboard/dist/clipboard.min.js',
				'public/lib/ngclipboard/dist/ngclipboard.min.js',
				'public/lib/isteven-angular-multiselect/isteven-multi-select.js',
				'public/lib/ckeditor/ckeditor.js',
				'public/lib/angular-ckeditor/angular-ckeditor.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',


			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
