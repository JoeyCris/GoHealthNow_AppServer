'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	async = require('async'),
	crypto = require('crypto');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
 exports.sendVerificationEmail = function(req, res, next){
 	async.waterfall([
 		// Generate random token
 		function(done) {
 			crypto.randomBytes(20, function(err, buffer) {
 				var token = buffer.toString('hex');
 				done(err, token);
 			});
 		},
 		// Lookup user by username
 		function(token, done) {
 			//console.log(req.body.username);
 			if (req.body.userName) {
 				User.findOne({
 					email: req.body.userName
 				}, '-salt -password', function(err, user) {
 					if (!user) {
 						return res.status(400).send({
 							message: 'No account with that username has been found'
 						});
 					} else if (user.provider !== 'local') {
 						return res.status(400).send({
 							message: 'It seems like you signed up using your ' + user.provider + ' account'
 						});
 					} else {
 						user.emailVerificationToken = token;

 						user.save(function(err) {
 							done(err, token, user);
 						});
 					}
 				});
 			} else {
 				return res.status(400).send({
 					message: 'Username field must not be blank'
 				});
 			}
 		},
 		function(token, user, done) {
 			//console.log(req.headers);
 			var baseUrl = 'https://' + req.headers.host;
 			if (req.headers.origin) {
 				baseUrl = req.headers.origin;
 			}
			if (user.language === 1){
				res.render('templates/email-vérification-confirmation', {
	 				name: user.displayName,
	 				appName: config.app.title,
	 				url: baseUrl + '/auth/verifyemail/' + token
	 			}, function(err, emailHTML) {
	 				done(err, emailHTML, user);
	 			});
			}else{
				res.render('templates/email-verification-confirm-email', {
	 				name: user.displayName,
	 				appName: config.app.title,
	 				url: baseUrl + '/auth/verifyemail/' + token
	 			}, function(err, emailHTML) {
	 				done(err, emailHTML, user);
	 			});
			}
 		},
 		// If valid email, send reset email using service
 		function(emailHTML, user, done) {
			var subject = 'Email Verification';
			if(user.language === 1){
				subject = 'vérification de l\'E-mail';
			}
 			var mailOptions = {
 				to: user.email,
 				from: config.mailer.from,
 				subject: subject,
 				html: emailHTML
 			};
 			smtpTransport.sendMail(mailOptions, function(err) {
 				if (!err) {
					console.log('An email has been sent to ' + user.email + ' with further instructions.');
 				// 	res.send({
 				// 		message: 'An email has been sent to ' + user.email + ' with further instructions.'
 				// 	});
 				} else {
 					return res.status(400).send({
 						message: 'Failure sending email'
 					});
 				}

 				done(err);
 			});
 		}
 	], function(err) {
 		if (err) return next(err);
 	});
 };

/**
 * Validate the Email Verification Token
 */
exports.validateEmailVerifyToken = function(req, res) {
	User.findOne({
		emailVerificationToken: req.params.token,
	}, function(err, user) {
		if (!user) {
			return res.redirect('/#!/verifyemail/invalid');
		}else{
			user.emailVerified = true;
			user.save(function(err){
				if(err){
					return res.status(400).send({
 						message: 'Failure save user infomation in Email Verification'
 					});
				}
				res.redirect('/#!/verifyemail/success');
			});
		}
	});
};
