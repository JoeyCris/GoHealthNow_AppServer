/**
 * Created by robertwang on 2016-08-08.
 */
'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	var fitbit = require('../controllers/records.fitbit.server.controller');


	//// Setting the fitbit oauth routes
	//app.route('/auth/fitbit').get(passport.authenticate('fitbit', {
	//	scope: ['activity','heartrate','location','profile']
	//}));
	//app.route('/auth/fitbit/callback').get(users.oauthCallback('fitbit'));

	app.route('/fitbit/exercise/record/:userID')
		.post(fitbit.addExerciseRecord);

	app.route('/fitbit/exercise/retrieveData/:period')
		.post(fitbit.retrieveData);

	app.route('/fitbit/user/unbind/:userID')
		.post(fitbit.unbindUser);


};
