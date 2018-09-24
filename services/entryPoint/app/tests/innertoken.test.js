// 'use strict';
//
// /**
//  * Module dependencies.
//  */
// var should = require('should'),
// 	mongoose = require('mongoose'),
// 	User = mongoose.model('User'),
// 	http = require('http'),
// 	request = require('supertest'),
// 	Article = mongoose.model('Article'),
// 	app = require('../../server'),
// 	agent = request.agent(app);
//
//
// /**
//  * Globals
//  */
// var user, credentials;
//
// /**
//  * Unit tests
//  */
// describe('InnerToken Unit Tests:', function() {
// 	beforeEach(function(done) {
// 		// Create user credentials
// 		credentials = {
// 			username: 'username',
// 			password: 'password'
// 		};
//
// 		// Create a new user
// 		user = new User({
// 			firstName: 'Full',
// 			lastName: 'Name',
// 			displayName: 'Full Name',
// 			email: 'test@test.com',
// 			userName: credentials.username,
// 			password: credentials.password,
// 			provider: 'local'
// 		});
// 		user.userID = user._id.toString();
// 		// Save a user to the test db and create new article
// 		user.save(function(err) {
// 			if(err) {
// 				console.log(err);
// 			}
//
// 			done();
// 		});
// 	});
//
// 	describe('Method InnerTokenByName', function() {
//
// 		it('should be able to list questions if logged in', function(done) {
// 			agent.post('/auth/signin')
// 				.send(credentials)
// 				.expect(200)
// 				.end(function(signinErr, signinRes) {
// 					// Handle signin error
//
// 					if (signinErr) {
// 						console.log(signinErr.toJSON())
// 						done(signinErr);
// 					}
//
// 					// Get the userId
// 					var userId = user.id;
//
// 					agent.get('/questions')
// 						.expect(200)
// 						.end(function(err, res) {
// 							// Handle article save error
// 							if (err) done(err);
//
// 							done();
//
// 						});
// 				});
// 		});
//
// 		it('should be able to list questions wit inner token', function(done) {
// 			agent.get('/auth/innertoken/name/' + user.userName)
// 				.expect(200)
// 				.end(function(signinErr, signinRes) {
// 					// Handle signin error
// 					if (signinErr) done(signinErr);
//
// 					// Get the userId
// 					var userId = user.id;
//
// 					agent.get('/questions')
// 						.expect(200)
// 						.end(function(err, res) {
// 							// Handle article save error
// 							if (err) done(err);
//
// 							done();
//
// 						});
// 				});
// 		});
//
// 	});
//
// 	describe('Method InnerTokenByID', function() {
//
// 		it('should be able to list questions wit inner token', function(done) {
// 			agent.get('/auth/innertoken/id/' + user.userID)
// 				.expect(200)
// 				.end(function(signinErr, signinRes) {
// 					// Handle signin error
// 					if (signinErr) done(signinErr);
//
// 					agent.get('/questions')
// 						.expect(200)
// 						.end(function(err, res) {
// 							// Handle article save error
// 							if (err) done(err);
//
// 							done();
//
// 						});
// 				});
// 		});
//
// 	});
//
// 	afterEach(function(done) {
// 		User.remove().exec(function() {
// 			//Article.remove().exec(done);
// 			done();
// 		});
// 	});
//
// });
//     //
// 	//	it('should be able to list questions if login', function(done) {
//     //
// 	//		var postData = JSON.stringify({
// 	//			'username' : 'glucoguide',
// 	//			'password' : 'glucoguide_2015'
// 	//		});
//     //
// 	//		var options = {
// 	//			hostname: 'localhost',
// 	//			port: 3000,
// 	//			path: '/auth/signin',
// 	//			method: 'POST',
// 	//			headers: {
// 	//				'Content-Type': 'application/json',
// 	//				'Content-Length': postData.length
// 	//			}
// 	//		};
//     //
// 	//		var req = http.request(options, function(res) {
// 	//			console.log('STATUS: ' + res.statusCode);
// 	//			//console.log('HEADERS: ' + JSON.stringify(res.headers));
// 	//			res.setEncoding('utf8');
// 	//			res.on('data', function (chunk) {
// 	//				console.log('BODY: ' + chunk);
//     //
// 	//			});
//     //
//     //
// 	//			var options2 = {
// 	//				hostname: 'localhost',
// 	//				port: 3000,
// 	//				path: '/questions',
// 	//				headers: {
// 	//					cookie: res.headers['set-cookie']
// 	//				}
// 	//			};
//     //
//     //
// 	//			//console.log('headers: ' + JSON.stringify(options2.headers));
//     //
// 	//			http.get(options2, function(res) {
// 	//				console.log("Got response: " + res.statusCode);
//     //
// 	//				res.on('data', function (chunk) {
// 	//					console.log('BODY: ' + chunk);
// 	//				});
//     //
// 	//				done();
// 	//			}).on('error', function(e) {
// 	//				console.log("Got error: " + e.message);
// 	//			});
//     //
// 	//		});
//     //
// 	//		req.on('error', function(e) {
// 	//			console.log('problem with request: ' + e.message);
// 	//		});
//     //
// 	//		req.write(postData);
// 	//		req.end();
// 	//	});
//     //
// 	//	it('should be able to list questions wit inner token', function(done) {
//     //
// 	//		var options = {
// 	//			hostname: 'localhost',
// 	//			port: 3000,
// 	//			path: '/auth/innertoken/id/559d6f2be90cec1936f2b04d',
// 	//			method: 'GET',
// 	//		};
//     //
// 	//		var req = http.request(options, function(res) {
// 	//			console.log('STATUS: ' + res.statusCode);
// 	//			//console.log('HEADERS: ' + JSON.stringify(res.headers));
// 	//			res.setEncoding('utf8');
// 	//			res.on('data', function (chunk) {
// 	//				console.log('BODY: ' + chunk);
//     //
// 	//			});
//     //
//     //
// 	//			var options2 = {
// 	//				hostname: 'localhost',
// 	//				port: 3000,
// 	//				path: '/questions',
// 	//				headers: {
// 	//					cookie: res.headers['set-cookie']
// 	//				}
// 	//			};
//     //
// 	//			//console.log('headers: ' + JSON.stringify(options2.headers));
//     //
// 	//			http.get(options2, function(res) {
// 	//				console.log("Got response: " + res.statusCode);
//     //
// 	//				res.on('data', function (chunk) {
// 	//					console.log('BODY: ' + chunk);
// 	//				});
//     //
// 	//				done();
// 	//			}).on('error', function(e) {
// 	//				console.log("Got error: " + e.message);
// 	//			});
//     //
// 	//		});
//     //
// 	//		req.on('error', function(e) {
// 	//			console.log('problem with request: ' + e.message);
// 	//		});
//     //
// 	//		req.end();
// 	//	});
//     //
// 	//});
