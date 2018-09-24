/**
 * Created by Canon on 2015-12-30.
 */

'use strict';

/**
 * Module dependencies.
 */
var upcFoodItems = require('../controllers/upcFoodItems.server.controller');


module.exports = function(app) {
	app.param('upc', upcFoodItems.checkbarcode);
	app.param('upc', upcFoodItems.upcFoodItemByUPC);
	app.route('/GlucoGuide/upcFoodItems/:upc')
		.get(upcFoodItems.read);

	app.route('/GlucoGuide/upcFoodItems').get(upcFoodItems.setResponseMethod);
	app.route('/GlucoGuide/upcFoodItems').get(upcFoodItems.setUpdateStrategy);
	app.route('/GlucoGuide/upcFoodItems').get(upcFoodItems.checkbarcode);
	app.route('/GlucoGuide/upcFoodItems').get(upcFoodItems.upcFoodItemByUPC);
	app.route('/GlucoGuide/upcFoodItems').get(upcFoodItems.read);

	app.route('/GlucoGuide/upcFoodItems').post(upcFoodItems.setResponseMethod);
	app.route('/GlucoGuide/upcFoodItems').post(upcFoodItems.checkbarcode);
	app.route('/GlucoGuide/upcFoodItems').post(upcFoodItems.upcFoodItemByUPC);
	app.route('/GlucoGuide/upcFoodItems').post(upcFoodItems.read);

};
