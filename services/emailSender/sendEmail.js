'use strict'

var config = require('./config/config'),
	nodemailer = require('nodemailer'),
	async = require('async');
var inlineBase64 = require('nodemailer-plugin-inline-base64');
var consolidate = require('consolidate');
var express = require('express');
var app = express();
app.engine('server.view.html', consolidate['swig']);

// Set views path and view engine
app.set('view engine', 'server.view.html');
// var config = {
// 	app: {
// 			title: 'GlucoGuide App server - Development Environment'
// 	},
// 	mailer: {
// 			from: process.env.MAILER_FROM || 'GlucoGuide',
// 			options: {
// 					service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
// 					auth: {
// 							user: process.env.MAILER_EMAIL_ID || 'support@glucoguide.com',
// 							pass: process.env.MAILER_PASSWORD || 'glucoguide123456'
// 					}
// 			}
// 	}
// };

// console.log(config.mailer.options);

/**
 * send email middleware
 */
var smtpTransport = nodemailer.createTransport(config.mailer.options);

var sendEmail = function(res, user, subject, innerContent, header, callback){
	// console.log(header);
	if(user.sendEmail === false){
		callback(null);
	}else{
		async.waterfall([
			function(done){
				done(null, user);
			},

			function(user, done) {
				// console.log(header+'/email/unsubscribe/'+user._id);
				app.render('templates/email-schema', {
					name: user.firstName,
					appName: config.app.title,
					content: innerContent,
					cache: false,
					unsubscribe: header+'/email/unsubscribe/'+user._id
				}, function(err, emailHTML) {
					// console.log(emailHTML);
					done(err, subject, emailHTML, user);
				});
			},
			// If valid email, send reset email using service
			function(subject, emailHTML, user, done) {
				var mailOptions = {
					to: user.email,
					from: config.mailer.from,
					subject: subject,
					html: emailHTML
				};
				smtpTransport.use('compile', inlineBase64);
				smtpTransport.sendMail(mailOptions, function(err) {
					// console.log(err);
					done(err, 'done');
				});
			}
		], function(err, message) {
			// console.log(err);
			if (err){
				callback(err,'Email sending failed');
			}else {
				callback(null, message);
			}

		});
	}

};

module.exports = sendEmail;
