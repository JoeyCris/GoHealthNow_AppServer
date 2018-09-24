'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	records = require('../controllers/adapter.records.controller'),
	rms = require('../utils/rms'),
	Meal = mongoose.model('Meal'),
	Glucose = mongoose.model('Glucose'),
	ObjectId = require('mongoose').Types.ObjectId,
	_ = require('lodash');

/**
 * Read user data
 */
exports.read = function(req, res) {
	var date = new Date(req.param('date'));
	var userID = req.param('userId');

	//console.log('date is:' + date.toString());
	records.getUserRecords(
		{
			'userID': new ObjectId(userID),
			'recordedTime':{
				'$gte': new Date(date.getFullYear(), date.getMonth(), date.getDate()),
				'$lt': new Date(date.getFullYear(), date.getMonth(), date.getDate()+1)
			}
		},

		function(err, userRecords){
			if(err) {
				console.log('In dietitians.server.ctrl: read', err.message);
				return res.status(400).send(err.message);
			} else {
				//console.log(userRecords);
				res.jsonp(userRecords);
			}
		});
};

exports.demoMealData = function(req, res) {

	var pageNumber = req.param('page_number') && req.param('page_number') <= 1000 ? req.param('page_number') : 0;

	var maxRecords = req.param('records_per_page')? req.param('records_per_page') : 10;

	if(maxRecords >= 1000) {
		maxRecords = 1000;
	}

	Meal.find({userID:'55cacc98289cc1a162a61b04'}, //local host: '55c5080e00dbf257afe98c4c'; test: '55cacc98289cc1a162a61b04'
		{'_id': 0, 'mealPhoto':1, 'mealType':1, 'cals':1, 'carb':1, 'fat':1, 'pro':1, 'recordedTime':1}
	).limit(maxRecords).skip(pageNumber)
		.exec(
		function(err, data) {//find(conditions).populate('food.itemID').exec( function(err, data) {

			if(err) {
				return res.status(400).send(err);
			} else if(data) {

				res.jsonp(data);
			}
		});
};

//var request = require('request');
//
//var http = require('http');
//
//function redirectUrl(callback) {
//	var temp='';
//	var options = {
//		host: 'localhost',
//		port: 3000,
//		path: '/#!/logbook/55c5080e00dbf257afe98c4c',
//		method: 'GET'
//	};
//	var req = http.request(options, function(res) {
//		console.log('STATUS: ' + res.statusCode);
//		console.log('HEADERS: ' + JSON.stringify(res.headers));
//		res.setEncoding('utf8');
//		res.on('data', function (chunk) {
//			temp = temp.concat(chunk);
//		});
//		res.on('end', function(){
//			callback(temp);
//		});
//	});
//	req.end();
//	//return temp;
//}
//
//exports.printLogbook = function(req, res) {
//	//request.get(
//	//	'http://localhost:3000/#!/logbook/55c5080e00dbf257afe98c4c',
//	//	function (error, response, body) {
//	//		res.jsonp(body);
//	//	}
//	//);
//	redirectUrl(function(data) {
//		res.writeHead(200, {'content-type': 'text/html'});
//		res.write(data); // <- content!
//		res.end();
//	});
//	//res.redirect('/#!/logbook/55c5080e00dbf257afe98c4c');
//};

//
//db.meals.aggregate([
// { $match:{userID:ObjectId("55cacc98289cc1a162a61b04")}},
// { $group:{_id:{type:"$mealType",day:{$dayOfYear: "$recordedTime"}},
// average:{$avg:"$mealScore"}}}
// ])

//db.glucoses.aggregate([ { $match: { userID:ObjectId("55cacc98289cc1a162a61b04")}}, { $group:{_id:{ range:{ $cond: [ { $gte: [ "$level", 10 ] }, 3, {$cond: [ { $lte: [ "$level", 4 ] }, 1, 2 ]} ] }}, total:{$sum:1}}} ])

//db.glucoses.aggregate([
// { $match: { userID:ObjectId("55c5080e00dbf257afe98c4c"),
// recordedTime:{$gt: ISODate("2015-08-25T04:00:00Z"),
//$lt:ISODate("2015-08-30T04:00:00Z")}}},
// { $group:{ _id:{ range:
//    { $cond: [ { $gte: [ "$level", 10 ] }, 3, {$cond: [ { $lte: [ "$level", 4 ] }, 1, 2 ]} ] }},
// total:{$sum:1}}} ])


//
//db.meals.aggregate([  { $match:{userID:ObjectId("55cacc98289cc1a162a61b04"),recordedTime:{$gt: ISODate("2015-08-25T04:00:00Z"),$lt:ISODate("2015-09-01T04:00:00Z")}}},
//	{ $group:{_id:{day: {$dayOfYear: "$recordedTime"},
//		type:{$cond: [ { $ne: [ "$mealType", "Snack" ] }, "Meal", "Snack" ]}},  score:{$avg:"$mealScore"},carb:{$sum:"$carb"},fibre:{$sum:"$fibre"},pro:{$sum:"$pro"},fat:{$sum:"$fat"},cals:{$sum:"$cals"}}},{$sort:{_id:1}}  ])
//
//
var wkhtmltopdf = require('wkhtmltopdf');
var request = require('request');
var fs = require('fs');
exports.saveCharts = function(req, res){
	// var pushServerUrl = 'http://localhost:3003/';
	// console.log(pushServerUrl);
	// console.log(JSON.stringify(req.body));
	var saveParam = {infile:JSON.stringify(req.body.chart),outfile:'/Users/liuchang/Downloads/phantomjs-2.0.0-macosx/bin/ppt.png'};
	// {'infile':'{xAxis: {categories: [\'Jan\', \'Feb\', \'Mar\', \'Apr\', \'May\', \'Jun\', \'Jul\', \'Aug\', \'Sep\', \'Oct\', \'Nov\', \'Dec\']},series: [{data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]}]};','callback':'function(chart) {chart.renderer.arc(200, 150, 100, 50, -Math.PI, 0).attr({fill : \'#FCFFC5\',stroke : \'black\',\'stroke-width\' : 1}).add();','constr':'Chart'};
	var baseUrl = 'https://' + req.headers.host;
	var dir = __dirname+'/../../public/images/'+req.param('userId');

	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}
	console.log('In dietitian: saveCharts: ', JSON.stringify(saveParam));
	fs.readFile(__dirname + '/../views/templates/GlucoGuide.html', 'utf8', function (err, html) {
		if (err) return console.log('In dietitian: saveCharts: failed to read file: ', err.message);
		var pdfhtml = html.replace('<replacement/>', req.body.html);
		pdfhtml = pdfhtml.replace(new RegExp('<h4 class="text-center"></h4>', 'g'), '<h4 class="text-center"><br/><br/><br/><br/></h4>');
		pdfhtml = pdfhtml.replace(new RegExp('</tbody>', 'g'), '</tbody><br/>');
		fs.writeFile(__dirname + '/../../public/images/' + req.param('userId') + '/GlucoGuide2.html', pdfhtml, 'utf8', function (err) {
			if (err) return console.log('In dietitian: saveCharts: failed to save: ', err.message);
			wkhtmltopdf(baseUrl + '/images/' + req.param('userId') + '/GlucoGuide2.html', {
				pageSize: 'A4',
				output: __dirname + '/../../public/images/' + req.param('userId') + '/out.pdf'
			});
			var returnURL = baseUrl + '/images/' + req.param('userId') + '/out.pdf';
			return res.jsonp({message: returnURL});
		});
	});



	// request.post(
	// 		pushServerUrl,
	// 		// {body:"{infile:{},outfile:\"/Users/liuchang/Downloads/phantomjs-2.0.0-macosx/bin/ppt.png\"}"},
	// 		{body:JSON.stringify(saveParam)},
	// 		// {
	// 		// 	'infile':"{xAxis: {categories: [\"Jan\", \"Feb\", \"Mar\"]},series: [{data: [29.9, 71.5, 106.4]}]}","outfile":"/Users/liuchang/Downloads/phantomjs-2.0.0-macosx/bin/ppt.png"
	// 		// },
	// 		function (error, response, body) {
	// 				if (!error && response.statusCode === 200) {
	// 					console.log('Push notification for APN sending success');
	// 					return 'Push notification for APN sending success';
	// 				}else{
	// 					console.log(body);
	// 					return 'Push notification for APN sending failed';
	// 				}
	// 		}
	// );
};



exports.bgSummary = function(req, res) {

	var users = req.param('users');
	var results = {};

	var selector = [];

	users.forEach(function(user) {
		var endDate = new Date(user.endTime);
		selector.push({
			userID: new ObjectId(user.userId),
			recordedTime:{
				$gt: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 6),
				$lt:new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1)
			}
		});

		results[user.userId] = {high:0, low:0};

	});

	Glucose.aggregate(
			[
				{ $match: {
					$and: [
						{$or: [{level: {$gt:10}},{level: {$lt:4}}]},
						{$or: selector}
					]
				}},
				{ $group:{
					//_id:"$userID",
					_id:{
						userID:'$userID',
							type:{$cond: [
								{ $gt: [ '$level', 10 ] }, 'high',
								'low'
							]}
					},
					total:{$sum:1}
				}
				}
			],
			function (err, data) {
				//console.log(JSON.stringify(data));
				if(err || ! data){
					console.log('In dietitian.server.ctrl: bgSummary: No data found or db error');
				} else {
					data.forEach(function (row) {
						if (row._id.type === 'high') {
							results[row._id.userID].high = row.total;

						} else {
							results[row._id.userID].low = row.total;
						}
					});
				}
				res.json(results);

			});



};

exports.logbookData = function(req, res) {


	var days = 7;//req.param('days');
	var startDate = new Date(req.param('startDate'));


	var userID = req.param('userId');

	console.log('logbookData: startdata:' + JSON.stringify(startDate) + 'userid:' + JSON.stringify(userID));

	var results = [];

	[0,1,2,3,4,5,6].forEach(function(row,index) {
		records.getUserRecords(
			{
				'userID': userID ,
				'recordedTime':{
					'$gte': new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + row),
					'$lt': new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + row +1)
				}
			},

			function(err, userRecords){
				if(err) {
					console.log(err);
					return res.status(400).send(err);
				} else {
					userRecords.noteRecords = undefined;
					userRecords.tipRecords = undefined;
					userRecords.QuestionRecords = undefined;

					results.push(userRecords);

					//console.log(results);

					if( index === 6) {
						res.jsonp(results);
					}
				}
			});

	});




	//console.log('date is:' + date.toString());

};


/**
 * List
 */
exports.list = function(req, res) {
	var user = req.user;
	rms.getUserListInDetail2(user, function(err, patients) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(patients);
		}
	});
};

/**
 * Dietitian middleware
 */
exports.dietitianByID = function(req, res, next, id) {
	if(mongoose.Types.ObjectId.isValid(id)){
		console.log('In dietitian.server.ctrl: dietitianByID: '+id);
		User.findById(id).exec(function(err, dietitian) {
			if (err) return next(err);
			if (!dietitian) return next(new Error('Failed to load Dietitian ' + id));
			req.dietitian = dietitian ;
			next();
		});
	} else {
		res.status(400).send('Bad request: invalid dietitian ID');

	}
};

/**
 * Dietitian authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	var userID = req.param('userId');
	if (req.user.roles.indexOf('dietitian') === -1 && userID !== req.user.userID) {
		//req.dietitian = req.user;
		console.log('Header:'+ JSON.stringify(req.user));
		console.log('Body:'+ JSON.stringify(userID));

		return res.status(403).send('User is not authorized');
	}
	next();
};
