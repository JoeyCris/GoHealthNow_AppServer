/**
 * Created by Canon on 2016-02-04.
 */

'use strict';

var brand = require('../controllers/brand.controller');
var users = require('../controllers/users.server.controller');
var admin = require('../controllers/admins.server.controller');

//users.requiresLogin, dietitians.hasAuthorization,
module.exports = function(app) {
	app.route('/GlucoGuide/brand/create')
		.post(users.requiresLogin, admin.hasAdminAuth, brand.create);

	app.route('/GlucoGuide/brand/update')
		.post(users.requiresLogin, admin.hasAdminAuth, brand.update);

	app.route('/GlucoGuide/brand')
		.post(brand.parseXmlReq, brand.hasAccessCodeAuth, brand.get, brand.res2xml);


	app.route('/GlucoGuide/brandInfo/:accessCode')
		.post(users.requiresLogin, admin.hasAdminAuth, brand.create)
		// .get(users.requiresLogin, brand.parseQueryReq, brand.read, brand.res2json)
		.get(brand.parseQueryReq, brand.read, brand.res2json)
		.put(users.requiresLogin, admin.hasAdminAuth, brand.update)
		.delete(users.requiresLogin, admin.hasAdminAuth, brand.delete);

	app.route('/GlucoGuide/brandInfo')
		.get(users.requiresLogin, brand.parseQueryReq, brand.list, brand.res2json);



	// app.route('/GlucoGuide/brandInfo/:brandId')
	// 	.get(users.requiresLogin, brand.read)
	// 	.put(users.requiresLogin, admin.hasAdminAuth, brand.update)
	// 	.delete(users.requiresLogin, admin.hasAdminAuth, brand.delete);
	//
	// app.route('/GlucoGuide/brandInfo')
	// 	.get(users.requiresLogin, brand.list)
	// 	.post(users.requiresLogin, admin.hasAdminAuth, brand.create);
	//
	// app.param('brandId',brand.brandById);
};
