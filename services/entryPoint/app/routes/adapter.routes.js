/**
 * Created by nodejs on 20/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
//var get_ip = require('ipware')().get_ip;


function get_access_history(req, res, next) {
	//var ip_info = get_ip(req);
	//console.log(ip_info);
	//console.log(req);
	next();
}


module.exports = function(app) {
	// User Routes
	var adUsers = require('../controllers/users.server.controller');
	var users = require('../controllers/adapter.users.controller');
	var records = require('../controllers/adapter.records.controller');
	var goalRecords = require('../controllers/adapter.records.goals.controller');
	var topic = require('../controllers/adapter.topic.controller');
	var files = require('../controllers/adapter.files.controller');
	var dietitians = require('../controllers/dietitians.server.controller');
	var userFoodItem = require('../controllers/adapter.userfooditem.controller');
	var profile = require('../controllers/profiles.server.controller');
	var food = require('../controllers/adapter.food.server.controller');

	app.use('/GlucoGuide', get_access_history);

	app.route('/GlucoGuide/regaction').post(users.update);
	app.route('/GlucoGuide/verifyaction').post(users.authenticate);

	app.route('/GlucoGuide/Write').post(records.addRecord); //RecordUploadingRequest
	//app.route('/GlucoGuide/Read').post(adUsers.requiresLogin, records.getRecords);
	app.route('/GlucoGuide/fileupload').post(files.uploadPhoto); //RecommendationRequest

	app.route('/GlucoGuide/delete').post(records.deleteRecord); //RecordUploadingRequest



	app.route('/GlucoGuide/upload/files').post(files.uploadFiles); //RecommendationRequest

	app.route('/GlucoGuide/recaction').post(topic.retrieve); //RecommendationRequest
	app.route('/GlucoGuide/recadd').post(topic.add); //Add recommendation from browser;
	app.route('/GlucoGuide/recupdate').post(topic.update); //Add recommendation from browser;
	app.route('/GlucoGuide/recdelete').post(topic.delete); //Delete recommendation

	app.route('/GlucoGuide/activity_level/list_recent')
		.post(profile.getActivityLevel)
		.get(profile.getActivityLevel);


	app.route('/GlucoGuide/macros/list_recent')
		.post(goalRecords.getMacrosGoal)
		.get(goalRecords.getMacrosGoal);



	app.route('/GlucoGuide/goals/list_recent')
		.post(goalRecords.getLatestGoal)
		.get(goalRecords.getLatestGoal);

	app.route('/GlucoGuide/goals/:userID')
		.post(adUsers.requiresLogin, goalRecords.createGoalClient)
		.get(adUsers.requiresLogin, goalRecords.getLatestGoalClient)
		.put(adUsers.requiresLogin, goalRecords.createGoalClient);
		//.put(adUsers.requiresLogin, goalRecords.updateGoalClient);

	app.route('/GlucoGuide/addUserFoodItem').post(userFoodItem.addUserFoodItem);
	app.route('/GlucoGuide/getUserFoodItem').post(userFoodItem.getUserFoodItem);

	app.route('/GlucoGuide/foods/search')
		.post(food.search)
		.get(food.search);
		//.get(food.search);

	app.route('/GlucoGuide/foods/item')
		.post(food.getItemInDetail)
		.get(food.getItemInDetail);

	app.route('/GlucoGuide/foods/autocomplete')
		.post(food.autocomplete)
		.get(food.autocomplete);

	app.route('/GlucoGuide/inputSelection')
		.post(profile.setInputSelection);

	app.route('/GlucoGuide/metadata/list')
		.post(profile.getMetadata)
		.get(profile.getMetadata);


};
