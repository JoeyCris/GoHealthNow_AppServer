'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var admin = require('../../app/controllers/admins.server.controller');

	// Admins Routes
	app.route('/admin/user')
		.get(users.requiresLogin, admin.hasAuthorization, admin.list);
		//.post(users.requiresLogin, admins.create);

	app.route('/admin/userCount')
		.get(users.requiresLogin, admin.hasAuthorization, admin.count);

	app.route('/admin/user/:userId')
		.get(users.requiresLogin, admin.hasAuthorization, admin.getUser)
		.put(users.requiresLogin, admin.hasAuthorization, admin.update);
	//	.delete(users.requiresLogin, admins.hasAuthorization, admins.delete);

	app.route('/admin/userList/:page')
		.get(users.requiresLogin, admin.hasAuthorization, admin.getUserList);
	// Finish by binding the Admin middleware
	app.param('userId', admin.userByID);
};
