'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Template = mongoose.model('TopicTemplate'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create template
 * tested
 */
 exports.create = function(req, res) {

 	var template = new Template(req.body);
 	template.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(template);
 		}
 	});

 };

 /**
  * Update a template
  */
 exports.update = function(req, res) {
 	var  template = req.template;
 	template = _.extend(template, req.body);
 	template.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(template);
 		}
 	});
 };


 /**
 * Read template by ID
 */

 exports.read = function(req, res){
  res.send(req.template);
};

 /**
  * Delete a template
  */
 exports.delete = function(req, res) {
 	var template = req.knowledge;

 	template.remove(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(template);
 		}
 	});
 };

 /**
  * List of templates
  * tested
  */
 exports.list = function(req, res) {
 	Template.find({creator: req.user.userID}, function(err, templates) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(templates);
 		}
 	});
 };
/**
* List of template types
* tested
*/
exports.listTypes = function(req, res) {
	res.json(Template.schema.path('type').enumValues);
};

/**
* List of templates by type
* tested
*/
exports.listByType = function(req, res) {
	var templateType = req.templateType;
	Template.find({type:templateType, creator: req.user.userID}, function(err, templates) {
		if (err) {
			console.log('Error in TopicTemplate.listByType: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(templates);
		}
	});
};
/**
* List of templates by User;
*/
exports.listByUser = function(req, res) {
// console.log(req);
Template.find({creator:req.templateUser.userID}).sort('-update_time').populate('creator', 'userID email').exec(function(err, templates) {
	if (err) {
		console.log('Error in TopicTemplate.listByUser: ', err.message);
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	} else {
		res.json(templates);
	}
});
};

/**
 * User template middleware
 */
exports.userById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	User.findById(id,{userID: 1,
		height: 1,
		weight: 1,
		gender: 1,
		dob: 1,
		waistSize: 1,
		lastName: 1,
		firstName: 1,
		accessCode: 1,
		bmi: 1,
		points: 1,
		promoteMessage: 1,
		updatedTime: 1,
		registrationTime: 1
	}).exec(function(err, user) {
		if (err) {
			console.log('Error in TopicTemplate.userById: ', err.message);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.templateUser = user;
			// console.log(user);
			next();
		}
	});
};

/**
* Template Type middleware
*/
exports.typeById = function(req, res, next, id) {
//console.log(Knowledge.schema.path('type').enumValues);
	var types = Template.schema.path('type').enumValues;
	req.templateType = types[id];
	//console.log(types[id]);
	next();
};

/**
* Template middleware
*/
exports.templateById = function(req, res, next, id) {

	Template.findById(id).exec( function(err, template) {
		if (err) {
			console.log('Error in TopicTemplate.templateById: ', err.message);
			return next(err);
		}
		if (!template) {
			console.log('Error in TopicTemplate.templateById: template not found');
			return res.status(404).send({
				message: 'template not found'
			});
		}
	req.template = template;
		next();
	});
};

/**
 * Template authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// TODO authorization for knowledge
	var creator = JSON.stringify(req.template.creator);

	if (req.user.userID !== creator.substring(1,creator.length-1)) {
		// console.log(typeof(req.user.userID) +' '+ typeof(req.template.creator));
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
