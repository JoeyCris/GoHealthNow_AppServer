'use strict';

/**
 * Module dependencies.
 */
//var records = require('../controllers/adapter.records.controller');
var records = require('../controllers/records.server.controller');
var users = require('../controllers/users.server.controller');
var admin = require('../../app/controllers/admins.server.controller');


module.exports = function(app) {

			//.post(users.requiresLogin,topics.create);
	app.route('/userRecords/a1c/:userID')
			.get(users.requiresLogin, records.hasAuthorization, records.getLatestA1C);

	app.route('/userRecords/reminder/:userID')
		.get(users.requiresLogin, records.hasAuthorization, records.getReminders);

	app.route('/userRecords/exercise/details')
		.get(records.getExerciseInDetail);

	app.route('/userRecords/details/a1c')
		.get(records.getA1CInDetail);

	app.route('/userRecords/details/weight')
		.get(records.getWeightInDetail);




	app.route('/userRecords/macrosGoal/listRecent')
		.get(records.getMacrosGoal);

	app.route('/userRecords/macrosGoal/:userID')
		.get(records.getMacrosGoal)
		.put(records.setMacrosGoal);

	app.route('/userRecords/exercise/details')
		.get(users.requiresLogin, records.hasAuthorization, records.getExerciseInDetail);

	app.param('userID', admin.userByID);

};
