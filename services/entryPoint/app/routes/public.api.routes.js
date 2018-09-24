/**
 * Created by robertwang on 2016-09-10.
 */

'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller');
var files = require('../controllers/adapter.files.controller');
var passport = require('passport');

var priavteAPI = require('../controllers/api.server.controller');


module.exports = function(app) {

	app.route('/public/api/v1.0/food_recognize')
		//.get(files.list);
		.post(files.foodRecognize);

	app.route('/public/api/v1.0/digits_recognize')
		//.get(files.list);
		.post(files.digitsRecognize);
	app.route('/public/api/v1.0/digits_recognize/list')
		//.get(files.list);
		.get(files.listAllDigitsImages);


	app.route('/private/api/translate')
		.get(priavteAPI.translate)
		.post(priavteAPI.translate);

};
