'use strict';

module.exports = {
	db: {
		uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/rawdata',
		options: {
			user: '',
			pass: ''
		}
	},
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	serverURL : 'https://api.glucoguide.com/',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-chart.js/dist/angular-chart.css',
				'public/lib/flexslider/flexslider.css',
				'public/lib/isteven-angular-multiselect/isteven-multi-select.css',
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
				'public/lib/ng-file-upload/ng-file-upload.js',
				'public/lib/ng-file-upload-shim/ng-file-upload-shim.js',
				'public/lib/Chart.js/Chart.js',
				'public/lib/angular-chart.js/dist/angular-chart.js',
				// 'public/lib/angular-flexslider/angular-flexslider.js',
				'public/lib/highcharts-ng/dist/highcharts-ng.js',

				'public/highcharts/js/highcharts.src.js',
				'public/highcharts/js/modules/data.js',
				'public/highcharts/js/themes/dark-unica.js',//dark-unica.js dark-blue.js
				'public/highcharts/js/modules/exporting.js',
				'public/lib/clipboard/dist/clipboard.min.js',
				'public/lib/ngclipboard/dist/ngclipboard.min.js',
				'public/lib/isteven-angular-multiselect/isteven-multi-select.js',
				'public/lib/ckeditor/ckeditor.js',
				'public/lib/angular-ckeditor/angular-ckeditor.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	fitbit: {
		clientID: '227MB3',
		clientSecret:  'eaf40e7ba413495eac6fe772ad659f6b',
		callbackURL: 'https://api.glucoguide.com/auth/fitbit/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'GoHealthNow',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'service@glucoguide.com',
				pass: process.env.MAILER_PASSWORD || 'ggservice123456'
			}
		}
	}
};
