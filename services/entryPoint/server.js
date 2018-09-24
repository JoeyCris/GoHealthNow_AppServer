'use strict';
/**
 * Module dependencies.
 */


process.chdir(__dirname);

var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	nodemailer = require('nodemailer'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));

		//delay 10 seconds to trigger restart process
		setTimeout(function () {
			process.exit(-1);
		}, 10000);

	}
});

mongoose.connection.on('error', function(err) {
		console.error(chalk.red('MongoDB connection error: ' + err));

		process.exit(-1);
	}
);


//console.log('process.env: ' + process.env());

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
//app.listen(config.port);

app.listen(config.port, '::');

//server.listen(8080, '::', function() {
//	console.log('listener');
//});

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('--');
console.log(chalk.green(config.app.title + ' application started'));
console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.db.uri));
if (process.env.NODE_ENV === 'secure') {
	console.log(chalk.green('HTTPs:\t\t\t\ton'));
}


var config = require('./config/config');
var smtpTransport = nodemailer.createTransport(config.mailer.options);

function sendUncaghtExceptionMail(emailHTML,  done) {
	var mailOptions = {
		to: 'robert.junwang@gmail.com, renfeng.liu@gmail.com, stongagelc@gmail.com',
		from: config.mailer.from,
		subject: 'Uncaught Exception in Server, Please have a look ASAP',
		html: emailHTML
	};

	console.log(config.mailer.options.auth.user);
	smtpTransport.sendMail(mailOptions, function(err) {
		if (!err) {
			console.log('send successfully');
		} else {
			console.log('failed to send email');
		}

		done(err);
	});
}


process.on('uncaughtException', function(err) {
	console.log('Caught unhandled exception: ');
	//console.trace(err);
	console.log(err.stack);
	//sendUncaghtExceptionMail(err, function(err) {
	//	if(err) {
	//		console.log('send mail with err'+err);
	//	} else {
	//		console.log('finished send email.');
	//	}
		//process.abort();
		//process.exit(-1);
		//app.send('restart');
	//});

});

console.log('--');
