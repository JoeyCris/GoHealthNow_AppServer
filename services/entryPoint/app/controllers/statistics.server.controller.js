'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    async = require('async'),
    get_ip = require('ipware')().get_ip,
    geoip = require('geoip-lite'),
	UserActivities = mongoose.model('UserActivities'),
	Brand = mongoose.model('Brand'),
	ObjectId = require('mongoose').Types.ObjectId,
	_ = require('lodash');

/**
 * Create a Statistic
 */
exports.activityStatistics = function(req, res) {
	var search = req.query.search;
	var query = UserActivities.find();
	if(req.query.currentPage && req.query.numPerPage && !search) {
		var currentPage = Number(req.query.currentPage);
		var numPerPage = Number(req.query.numPerPage);
		query = query.sort({activityTime:-1}).skip(currentPage-1).limit(numPerPage);
	}

	query.populate('user').exec(function (err, data) {
		if(err) {
			res.status(400).send('No records found');
		}
		else {
			if(!search) {
				return res.jsonp(data);
			}
			var filteredData = data.reduce(function(prev, next) {
				var str = JSON.stringify(next);
				if(str.indexOf(search) > -1) {
					prev.push(next);
				}
				return prev;
			},[]);
			return res.jsonp(filteredData);
		}
	});
};


exports.activityStatisticsCount = function(req, res) {
	UserActivities.count().exec(function(err, data) {
		if(err) {
			res.status(400).json({message: err.message});
		} else {
			res.json({count: data});
		}
	});
};

exports.getLatestRecordDate = function(req, res) {
	var userID = req.param('userID');
	if(!mongoose.Types.ObjectId.isValid(userID)) {
		return res.status(400).send('Bad request: Invalid userID');
	}

	//console.log('getLatestRecordDate: userID' + userID);
	var dateList = [];
	//UserActivities.find(
	//	{
	//		user:new ObjectId(userID),
	//		activityName:'upload record'
	//	},
	//	{
	//		activityTime:1,
	//		_id:-1
	//	}
	//)
	//	.sort({activityTime:-1})
	//	.limit(3)
	//	.exec(function (err, data) {
	//		if(err || !data.length) {
	//			return res.jsonp(dateList);
	//		}
	//		for(var i = 0; i < data.length; i++) {
	//			dateList.push(data[i].activityTime.toString());
	//		}
	//		res.jsonp(dateList);
	//});

	UserActivities.aggregate(
		[
			{
				$match : { user:new ObjectId(userID)}
			},
			{
				$group : {
					_id : {
						year: { $year : '$activityTime'},
						month: { $month : '$activityTime' },
						day: { $dayOfMonth : '$activityTime'}
					}
				}
			},
			{
				$sort : { _id: -1}
			},
			{
				$limit:3
			}
		],


		function (err, data) {
			if (err) {
				console.log('In statistics.server.controller: getLatestRecordData', err.message);
				res.json(dateList);
			} else {
				for(var i = 0; i < data.length; i++){
					dateList.push(new Date(data[i]._id.year, data[i]._id.month - 1, data[i]._id.day));
				}
				res.json(dateList);
			}
		});
};

/**
 * Show the current Statistic
 */
exports.userStatistics = function(req, res) {
	var statistics = {};
	var oneMonth = new Date();
	oneMonth.setDate(oneMonth.getDate() - 30);
	var now = new Date();

	var tz_offset = now.getTimezoneOffset() * 60 * 1000;
	//console.log(tz_offset);

	async.parallel(
		[
			function(callback) { // Total number of users;
				User.count({}, function(err, count) {
					if(err) {
						callback(err);
					} else if(count) {
						statistics.numOfUsers = count;
						callback(null);
					}
				});
			},

			function(callback) { // new registered users
				User.aggregate(
					[
						{
							$match : { registrationTime : {$gte: oneMonth} }
						},

						{
							$group : {
								_id : {
									year: { $year : [ {$add:['$registrationTime', -tz_offset]} ]},
									month: { $month : [ {$add:['$registrationTime', -tz_offset]} ] },
									day: { $dayOfMonth : [ {$add:['$registrationTime', -tz_offset]} ]}
								},
								count : { $sum : 1 }
							}
						},
						{
							$sort : { _id : 1 }
						}

					],

					function (err, data) {
						if (err) {
							console.log('In statistics.server.controller: userStatistics', err.message);
							callback(err);
						} else {
							//console.log(JSON.stringify(data));
							statistics.newUserStats = data;
							callback(null);
						}
					});
			},

			function(callback) { // active users
				User.aggregate(
					[
						{
							$match : { lastLoginTime : {$gte: oneMonth} }
						},

						{
							$group : {
								_id : {
									year: { $year : [ {$add:['$lastLoginTime', -tz_offset]} ]},
									month: { $month : [ {$add:['$lastLoginTime', -tz_offset]} ] },
									day: { $dayOfMonth : [ {$add:['$lastLoginTime', -tz_offset]} ]}
								},
								count : { $sum : 1 }
							}
						},
						{
							$sort : { _id : 1 }
						}
					],


					function (err, data) {
						if (err) {
							console.log('In statistics.server.controller: userStatistics', err.message);
							callback(err);
						} else {
							//console.log(JSON.stringify(data));
							statistics.activeUserStats = data;
							callback(null);
						}
					});
			}

		],

		function(err) {
			if(err) {
				return res.status(400).send('Failed to get user statistics.');
			} else {
				//console.log(statistics);
				res.jsonp(statistics);
			}
		});
};


exports.saveUserActivity = function(id, activityName, req) {

	User.findOne({userID: id}, function(err, user){
		if(err || !user) {
			console.log('In statistics.server.controller: userStatistics', 'can not find user ');
		} else {
			if (user.email && user.email.indexOf('1@test.com') === -1) { // filter out test account
				//console.log(user.email);
				var activity = new UserActivities();
				activity.user = user;
				activity.activityName= activityName;
				activity.activityTime = Date.now();
				//activity.ipAddress = get_ip(req).clientIp;
				//console.log('activity.ipAddress:' + activity.ipAddress);
				//var geo = geoip.lookup(activity.ipAddress);
				//if (geo) {
				//	activity.location =geo.city + ' '+geo.country;
				//}

				activity.save(function(err){
					if(err) {
						console.log('Save user activity failed');
						console.log(JSON.stringify(err));

					}
				});
			}
		}
	});
};

exports.getOrgStatistics = function(req, res) {
	//Brand.aggregate([
	//	{$group: {_id: '$brandAccessCode'}}
	//], function (err, orgAccesscodes) {
	//	var orglist = [];
	//	orgAccesscodes.forEach(function (item) {
	//		orglist.push(item._id);
	//	});
	//	console.log(orglist);
	//	User.aggregate(
	//		[
	//			{
	//				$match : { accessCode: {$exists: true, $in: orglist}}
	//				// $filter: {
	//				// 	input: '$Brand',
	//				// 	as: 'brand',
	//				// 	cond: {$exists: '$Brand.brandAccessCode'}
	//				// }
	//			},
	//			{
	//				$group : {
	//					_id : '$accessCode',
	//					count : { $sum : 1 }
	//				}
	//			},
	//			{
	//				$sort : { count : -1 }
	//			}
	//		],
    //
	//		function (err, data) {
	//			if (err) {
	//				console.log('In statistics.server.controller: getOrgStatistics', err.message);
	//				return res.status(400).send('Failed to get user statistics for access Code');
	//			} else {
	//				// console.log(JSON.stringify(data));
	//				res.jsonp(data);
	//			}
	//		});
    //
	//});


		User.aggregate(
			[
				{
					$match : { accessCode: {$exists: true, $nin: ['00000000','']}}
				},
				{
					$group : {
						_id : '$accessCode',
						count : { $sum : 1 }
					}
				},
				{
					$sort : { count : -1 }
				},
				{ $match : { count : {$gt: 1} } }
			],

			function (err, data) {
				if (err) {
					console.log('In statistics.server.controller: getOrgStatistics', err.message);
					return res.status(400).send('Failed to get user statistics for access Code');
				} else {
					// console.log(JSON.stringify(data));
					res.jsonp(data);
				}
			});




};


/**
 * Statistic authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.user.roles.indexOf('admin') === -1) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
