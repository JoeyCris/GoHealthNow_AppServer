'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller');
var files = require('../controllers/files.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/fileupload')
			//.get(files.list);
			.post(users.requiresLogin,files.uploadFiles);


	//app.route('/users/:userId')
			//.get(topics.read)
			//.put(users.requiresLogin,topics.hasAuthorization, topics.update)
			//.delete(users.requiresLogin,topics.hasAuthorization, topics.delete);

	//app.param('userId',users.userByID);
	app.route('/filedownload')
			//.get(files.list);
			.get(files.downloadFiles);
};
