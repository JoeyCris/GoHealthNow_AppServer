'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Email = mongoose.model('Email'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create Email base
 * tested
 */
 exports.create = function(req, res) {


	// console.log(JSON.stringify(req.body));
	// console.log('qwqwqw');
	// var userIDs = [];
	// req.body.users.forEach(function(element,index,array){
	// 	userIDs.push(element._id);
	// });
	// req.body.users = userIDs;
	var mail = new Email(req.body);
	// console.log(JSON.stringify(mail));
	// console.log('12313');

	mail.unsend = [];
	mail.sended = [];
	mail.total = mail.users.length;
	mail.progress = 0;
	// return;
 	mail.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(mail);
 		}
 	});

 };

 /**
  * Update a mail base
  */
 exports.update = function(req, res) {
 	var  mail = req.mail;
 	mail = _.extend(mail, req.body);
	mail.unsend = [];
	mail.sended = [];
	mail.total = mail.users.length;
	mail.progress = 0;
 	mail.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(mail);
 		}
 	});
 };


 /**
 * Read mail base by ID
 */

 exports.read = function(req, res){
  res.send(req.mail);
};

 /**
  * Delete a mail base
  */
 exports.delete = function(req, res) {
 	var mail = req.mail;

 	mail.remove(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(mail);
 		}
 	});
 };

 /**
  * List of mail base
  * tested
  */
 exports.list = function(req, res) {
 	Email.find({}, function(err, mail) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(mail);
 		}
 	});
 };
/**
* List of mail statuses
* tested
*/
exports.listStatuses = function(req, res) {
	res.json(Email.schema.path('status').enumValues);
};

/**
* List of mail by statuses
* tested
*/
exports.listByStatus = function(req, res) {
	var mailStatus = req.mailStatus;
	Email.find({status:mailStatus}, function(err, mail) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(mail);
		}
	});
};

/**
* unsubscribe Email notification
*
*/

exports.unsubscribe = function(req, res) {
	var user = req.user;
	user.sendEmail = false;
	user.save(function(err, user){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.send('Unsubscribe successful!');
		}
	});
};

/**
* mail Status middleware
*/
exports.statusById = function(req, res, next, id) {
//console.log(Email.schema.path('status').enumValues);
	var statuses = Email.schema.path('status').enumValues;
	req.mailStatus = statuses[id];
	//console.log(statuss[id]);
	next();
};

/**
* mail middleware
*/
exports.emailById = function(req, res, next, id) {

	Email.findById(id).populate('users',{userID: 1, email:1}).exec( function(err, mail) {
		if (err) {
			return next(err);
		}
		if (!mail) {
			return res.status(404).send({
				message: 'mail not found'
			});
		}
		req.mail = mail;
		next();
	});
};

exports.userById = function(req, res, next, id) {

	User.findById(id).exec( function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(404).send({
				message: 'user not found'
			});
		}
		req.user = user;
		next();
	});
};

/**
 * mail authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// TODO authorization for mail
	// if (req.user.id !== someAuthorizedID) {
	// 	return res.status(403).send({
	// 		message: 'User is not authorized'
	// 	});
	// }
	next();
};
