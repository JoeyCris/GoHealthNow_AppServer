'use strict'

var config = require('../../config/config'),
	nodemailer = require('nodemailer'),
	async = require('async');
	var inlineBase64 = require('nodemailer-plugin-inline-base64');

/**
 * send email middleware
 */
var smtpTransport = nodemailer.createTransport(config.mailer.options);

var sendEmail = function(req, res, user, subject, innerContent){
	if(user.sendEmail === false){
		return ('user is not in email list');
	}else{
		async.waterfall([
			function(done){
				done(null, user);
			},

			function(user, done) {
				if(user.language === 1){
					//res.render('templates/email-schema', {
					res.render('templates/email-schéma', {
						name: user.firstName,
						appName: config.app.title,
						content: innerContent,
						unsubscribe: 'https://'+req.headers.host+'/email/unsubscribe/'+user._id
					}, function(err, emailHTML) {
						done(err, subject, emailHTML, user);
					});
				}else{
					res.render('templates/email-schema', {
					//res.render('templates/email-schéma', {
						name: user.firstName,
						appName: config.app.title,
						content: innerContent,
						unsubscribe: 'https://'+req.headers.host+'/email/unsubscribe/'+user._id
					}, function(err, emailHTML) {
						done(err, subject, emailHTML, user);
					});
				}

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
					done(err, 'done');
				});
			}
		], function(err, message) {
			if (err){
				console.error('Email sending failed: ', err.message);
				return 'Email sending failed';
			}else{
				return message;
			}

		});
	}
};

module.exports = sendEmail;
