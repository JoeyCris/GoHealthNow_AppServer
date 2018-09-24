/**
 * Created by robert on 2016-12-17.
 */
'use strict';

var translateService = require('../utils/translateService');

var errorHandler = require('./errors.server.controller');

exports.translate = function(req, res) {

	var content = req.param('content');
	var source = req.param('source') || 'en';
	var target = req.param('target') || 'fr';

	translateService.translate(content,source,target, function(err, body) {
		if (err) {
			console.error('Cannot translate: ', err.message);
			res.status(400).send({
				message: 'failed to call translate service API: '+errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(body);
		}
	});



};
