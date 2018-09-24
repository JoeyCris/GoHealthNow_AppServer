/**
 * Created by nodejs on 21/04/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../config/config'),
	errorHandler = require('./errors.server.controller.js'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Topic = mongoose.model('Topic'),
	User = mongoose.model('User'),
	activity = require('./statistics.server.controller'),
	genXmlOutput = require('../utils/genxmloutput.js');

var appName = config.app.title;

// TODO: Add logic to get topic.
function TopicGetter(userID,start_time,end_time) {
	if (!(this instanceof TopicGetter)) {
		console.log('TopicGetter not initialized');
		return new TopicGetter(userID);
	}

	EventEmitter.call(this);
	var getter = this;

	if(!end_time){
		end_time = new Date();
	}

	if(start_time){
		//console.log('start_time:', start_time, ' end_time:', end_time);
		Topic.find({
			user: userID,
			update_time: {
	        $gt: start_time,
	        $lt: end_time
	    }
		}).sort({ 'create_time' : 1 }).exec(function(err, data) {
			if (err) {
				getter.emit('error', err);
			} else {
				getter.emit('data', data);
			}
		});
	}else{
		Topic.find({
			user: userID,
			update_time: {
	        $lt: end_time
	    }
		}).sort({ 'create_time' : 1 }).exec(function(err, data) {
			if (err) {
				getter.emit('error', err);
			} else {
				getter.emit('data', data);
			}
		});
	}


}

util.inherits(TopicGetter, EventEmitter);

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
			var recommendationXML = result.recommendation;
			if(!(recommendationXML.version)){
				var newRecXML = {};
				newRecXML.description = recommendationXML.content;
				newRecXML.creator = recommendationXML.expertSignature;
				newRecXML.links = [{uri:recommendationXML.imageURL, mimeType:'image/jpg'},{uri:recommendationXML.uRL, mimeType:'image/jpg'}];
				newRecXML.type = recommendationXML.type;
				newRecXML.create_time = recommendationXML.createdtime;
				newRecXML.user = recommendationXML.userID;
				recommendationXML = newRecXML;
			}
			console.log(recommendationXML);
			var recommendation = new Topic(recommendationXML);
			recommendation.save(function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.end(recommendation._id.toString());
				}
			});
		}
	});

};

/**
 * update recommendation based on recommendation ID
 */
exports.update = function(req, res) {
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
			var recommendationXML = result.recommendation;
			if(!(recommendationXML.version)){
				var newRecXML = {};
				newRecXML.description = recommendationXML.content;
				newRecXML.creator = recommendationXML.expertSignature;
				newRecXML.links = [{uri:recommendationXML.imageURL, mimeType:'image/jpg'},{uri:recommendationXML.uRL, mimeType:'image/jpg'}];
				newRecXML.type = recommendationXML.type;
				newRecXML.create_time = recommendationXML.createdtime;
				newRecXML.user = recommendationXML.userID;
				recommendationXML = newRecXML;
			}
			console.log(recommendationXML);
			recommendationXML.update_time = Date.now();
			var recommendation = Topic.update({_id:recommendationXML.id},{$set: recommendationXML}, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.end('success');
				}
			});
		}
	});

};

/**
 * Retrive recommendation and send it to mobile.
 */
exports.get = function(req, res) {


	var xml = req.body.infile;
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
		if (result.recommendation_Request) {
			var recommendation_request = result.recommendation_Request;
			var userID = recommendation_request.userID;
			var start_time = new Date(recommendation_request.startTime);
			var end_time = new Date(recommendation_request.endTime);
			var topicGetter = new TopicGetter(userID, start_time, end_time);

			topicGetter.on('data', function(advice) {
				//console.log(advice);
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

			topicGetter.on('error', function(err) {
				console.log('In adaptor.topic.ctrl: get', err.message);
				res.status(400).send('error');
			});
		}

	});
};

/**
 * Retrive recommendation and send it to mobile.
 */
exports.retrieve = function(req, res) {
	var xml = req.body.infile;
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
		if (result.recommendation_Request) {
			var recommendation_request = result.recommendation_Request;
			var userID = recommendation_request.userID;
			var versionNumber = recommendation_request.versionNumber;
			var latestRecommendationTime = new Date(recommendation_request.latest_RecommendationTime);
			var end_time = new Date();
			//console.log('user id is: ' + userID);
			User.findOne({userID: userID}).exec(function(err, user){
				if(err){
					console.log('user not found');
					res.status(400).send('No such user');
				}else if(user){
					//console.log(userID+' '+user.retrieveTime+' '+user._id);
					//var end_time = new Date(recommendation_request.latest_RecommendationTime);
					var start_time = user.retrieveTime;
					//if(user.retrieveTime){
					//	start_time = user.retrieveTime;
					//} else {
					//	start_time = user.registrationTime;
					//}

					console.log(userID+' '+start_time+' '+end_time);
					var newRetieveTime = start_time;
					var topicGetter = new TopicGetter(userID, start_time, end_time);
					topicGetter.on('data', function(advices) {
						if (advices && advices.length) {
							var returnAdvices=[];

							advices.forEach(function(advice){
								var returnAdvice = {};
								//console.log('create_time:',advice.create_time);
								if( newRetieveTime.getTime() < advice.create_time.getTime()) {
									//console.log('update retrieve time');
									newRetieveTime = advice.create_time;
								}
								returnAdvice._id = undefined;
								returnAdvice.__v = undefined;
								returnAdvice.createdtime = advice.create_time;
								returnAdvice.content = advice.description;
								returnAdvice.ExpertSignature = appName;
								// returnAdvice.ExpertSignature = advice.creator;
								if(advice.medias && advice.medias.length){
									returnAdvice.ImageURL = advice.medias[0].uri;
								}
								switch(advice.type){
									case 'instruction':
								  	returnAdvice.type = 11;
								  	break;
									case 'tip':
								  	returnAdvice.type = 10;
								  	break;
									case 'answer':
								  	returnAdvice.type = 2;
								  	break;
									default:
										returnAdvice.type = 1;
								}
								returnAdvice.uRL = advice.link;
								returnAdvices.push(returnAdvice);
							});

							User.update({userID : userID},{retrieveTime: newRetieveTime}).exec();

							returnAdvices = {
								'Recommendation': returnAdvices
							};
							var xml = genXmlOutput('Recommendations', returnAdvices);
							//console.log(xml);
							res.end(xml);
						} else {
							//console.log('No Recommendation');
							res.end('No Recommendation');
						}
					});

					topicGetter.on('error', function(err) {
						console.log('In adaptor.topic.ctrl: retrieve', err.message);
						res.status(400).send('error');
					});

					activity.saveUserActivity(user.userID, 'get recommendation',req);
				} else if(!user) {
					console.log('In adaptor.topic.ctrl: retrieve ', 'no such user');
					res.status(400).send('No such user');
				}
			});

		}
	});
};

/**
 * Delete recommendation based on ID
 */
exports.delete = function(req, res) {

	var xml = req.body.Recomendation;

	console.log(xml);
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

			var recommendationXML = result.recommendation;
			// Delete recommendation
			Topic.remove({ _id:recommendationXML.id }, function(err) {
			    if (!err) {
						res.status(400).send(err);
			    }
			    else {
						res.status(200).send('success');
			    }
			});
		}
	});
};
