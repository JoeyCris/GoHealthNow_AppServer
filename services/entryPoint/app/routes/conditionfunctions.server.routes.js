'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller'),
		conditionfunction = require('../controllers/conditionfunction.server.controller');
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	app.route('/conditionfunction/type')
			.get(users.requiresLogin,conditionfunction.listTypes);
	app.route('/conditionfunction/type/:typeId')
			.get(users.requiresLogin,conditionfunction.listByType);

	app.param('typeId',conditionfunction.typeById);

	app.route('/conditionfunction')
			.get(users.requiresLogin,conditionfunction.list)
			.post(users.requiresLogin,conditionfunction.create);
	app.route('/conditionfunction/:conditionfunctionId')
			.get(users.requiresLogin,conditionfunction.read)
			.put(users.requiresLogin,conditionfunction.hasAuthorization,conditionfunction.update)
			.delete(users.requiresLogin,conditionfunction.hasAuthorization,conditionfunction.delete);

  app.param('conditionfunctionId',conditionfunction.conditionFunctionById);

};
