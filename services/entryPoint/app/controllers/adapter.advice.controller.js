/**
 * Created by nodejs on 21/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('./errors.server.controller.js'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Advice = mongoose.model('Advice'),
	User = mongoose.model('User'),
	genXmlOutput = require('../utils/genxmloutput.js');


// TODO: Add logic to get advice.
function AdviceGetter(userID) {
	if (!(this instanceof AdviceGetter)) {
		console.log('AdviceGetter not initialized');
		return new AdviceGetter(userID);
	}

	EventEmitter.call(this);
	var getter = this;

	Advice.findOne({
		type: 10
	}, function(err, data) {
		if (err) {
			getter.emit('error', err);
		} else {
			getter.emit('data', data);
		}
	});
}

util.inherits(AdviceGetter, EventEmitter);


/**
 * retrive recommendation and send it to mobile.
 */
exports.retrieve = function(req, res) {
	var adviceGetter = new AdviceGetter(10);
	adviceGetter.on('data', function(advice) {
		// console.log(advice);
		if (advice) {
			advice._id = undefined;
			advice.__v = undefined;
			advice = {
				'Recommendation': advice
			};
			var xml = genXmlOutput('Recommendations', advice);
			res.end(xml);
		} else {
			res.end('No new recommendation');
		}

	});

	adviceGetter.on('error', function(err) {
		console.log('Failed to retrive recommendation: ', err.message);
		res.status(400).send('error');
	});
};


/*
 * Add recommendation to database.
 */
exports.add = function(req, res) {
	var xml = req.body.Recomendation;

	// console.log(xml);
	var parseString = require('xml2js').parseString;

	var toLowerCase = function(name) {
		return name.charAt(0).toLowerCase() + name.slice(1);
	};

	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function(err, result) {
		if (err) res.status(400).send(err);

		if (result.recommendation) {
			//console.log(result.recommendation);
			var recommendation = new Advice(result.recommendation);
			recommendation.save(function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.end('success');
				}
			});
		}
	});

};
