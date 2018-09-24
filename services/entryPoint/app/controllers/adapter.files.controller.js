'use strict';

var _ = require('lodash'),
	fs = require('fs'),
	errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	activity = require('./statistics.server.controller'),
	request = require('request'),
	genXmlOutput =  require('../utils/genxmloutput.js'),
	NutritionFacts = mongoose.model('NutritionFacts'),
	FoodItem = mongoose.model('FoodItem'),
	PhotoUpload = mongoose.model('PhotoUpload');

var TopN_Number = 10;

var generateUUID = require('../utils/dbUtils').generateUUID;

/*
 Parse string like"20150629_163850" and return a Date Object.
 */
function parseDateFromDateStr(dateStr) {

	return new Date(
		dateStr.slice(0, 4),
		dateStr.slice(4, 6),
		dateStr.slice(6, 8),
		dateStr.slice(9, 11),
		dateStr.slice(11, 13),
		dateStr.slice(13, 15)
	);
}


function getAvgNutritionFacts(predictions, curr, topn, total_percent, total, callback) {

	if(curr > topn ) {
		total.calories /= total_percent;
		total.carbs /= total_percent;
		total.fat /= total_percent;
		total.protein /= total_percent;

		return callback(null, total);
	}

	NutritionFacts.findOne({name:predictions[curr].name}, function(err, data){
		if(err || !data) {
			console.log('Food label not found in database: ' + predictions[curr].name);
			return callback(new Error('Food label not found in database'));
		}

		console.log('predictions[curr].name: '+ predictions[curr].name);
		total_percent += predictions[curr].prob;
		total.calories += predictions[curr].prob * data.calories;
		total.carbs += predictions[curr].prob * data.carbs;
		total.fat += predictions[curr].prob * data.fat;
		total.protein += predictions[curr].prob * data.protein;
		curr += 1;
		getAvgNutritionFacts(predictions, curr, topn,  total_percent, total, callback);
	});
}


// TODO: Get nutrition facts
function getNutritionFacts(predictions, callback) {

	if(!predictions) {
		callback(new Error('prediction result is invalid.'));
	} else {

		var topn = predictions.length > TopN_Number ? TopN_Number: predictions.length;


		var defaultServings = {
			servingSizeOption: [
				{
					servingSize:'1 sandwich (multigrain)',
					servingSizeID: 1032,
					calories:365,
					carbs: 46,
					fat: 12,
					protein: 18,
					'fibre':3
				}
			]
		};

		var labels = predictions.slice(0, topn);

		labels.forEach(function(label, index) {
			FoodItem.findOne({_id:{$gt:801000}, name: label.name},
				{
					_id:1,
					name:1,
					calories:1,
					carbs:1,
					fat:1,
					protein:1,
					servingSizeOptions:1
				}, function (err, data) {
					if (err || !data) {
						console.log('Food label not found in database: ' + labels[index].name);
						//return callback(new Error('Food label not found in database'));
						labels[index].itemID = 801032;
						labels[index].servingSizeOptions = defaultServings;
						labels[index].servingSize = defaultServings.servingSize;
						labels[index].servingSizeID = defaultServings.servingSizeID;
						labels[index].nutrition = {
							calories: defaultServings.calories,
							carbs: defaultServings.carbs,
							fat: defaultServings.fat,
							protein: defaultServings.protein
						};

					} else {
						labels[index].itemID = data._id;

						var options = [];

						data.servingSizeOptions.forEach(function(rowData, ssindex) {
							options.push({
								servingSize:rowData.name,
								servingSizeID: rowData.ssid,
								calories:rowData.calories,
								carbs: rowData.carbs,
								fat: rowData.fat,
								protein: rowData.protein,

								transFat: rowData.transFat,
								sodium: rowData.sodium,
								fibre: rowData.fibre,
								sugars: rowData.sugars,

							});
						});

						//console.log(JSON.stringify(options));

						labels[index].servingSizeOptions = {
							servingSizeOption: options
						};


						//	//for old interface
						//<Label>
						//	<Name>Apple</Name>
						//	<Prob>0.2122</Prob>
						//	<ServingSize>1 item</ServingSize>
						//	<ServingSizeID>12345</ServingSizeID>
						//	<ItemID>123123</ItemID>
						//	<Nutrition>
						//	<ServingSize>1 item</ServingSize>
						//	<Calories>365</Calories>
						//	<Carbs>46</Carbs>
						//	<Fat>12</Fat>
						//	<Protein>18</Protein>
						//	</Nutrition>
						//	</Label>

						labels[index].servingSize = options[0].servingSize;
						labels[index].servingSizeID = options[0].servingSizeID;
						labels[index].nutrition = {
							calories: options[0].calories,
							carbs: options[0].carbs,
							fat: options[0].fat,
							protein: options[0].protein
						};


					}

					if(index === topn -1) {
						//console.log('labels: ' + JSON.stringify(labels));
						callback(null, labels);
					}
				});
		});
	}

}


function assemblePredictionResult(req, res, predictions, photo_type, prediction_status){


	var output = {};

	if(!predictions) {
		output.classficiation_status = 1;
		output.photo_type = photo_type;
		var xml = genXmlOutput('photo_upload', output);
		res.end(xml);
	}

	output.photo_type = photo_type;
	getNutritionFacts(predictions, function(err, labels){
		if(err) {
			output.classficiation_status = 1;
		} else {
			if(prediction_status) {
				output.classficiation_status = 0;
			} else {
				output.classficiation_status = 1;
			}

			output.lables={};
			output.lables.label=labels;

		}
		var xml = genXmlOutput('photo_upload', output);
		res.end(xml);
	});


}


function getPhotoPrediction(req, res, photo_path, photo_type) {
	request.post(
		'http://kdd.csd.uwo.ca:9999/classifyimage',
		{form:{'photo_path':photo_path}},
		function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var prediction;
				try {
					prediction = JSON.parse(body);
				} catch (e) {
					console.log('enable to parse body:', e);
				}
				assemblePredictionResult(req, res, prediction, photo_type, true);
			}else{
				console.log('post request failed!');
				//assemblePredictionResult(req, res, prediction, photo_type, false);
				assemblePredictionResult(req, res, undefined, photo_type, false);
			}
		}
	);
}

function genPhotoUploadResponse(req, res) {
	var xml = genXmlOutput('photo_upload', {'photo_type': 0});
	res.end(xml);
}


function processUploadedPhoto(req, res, target_path, photo_type) {

	switch (photo_type) {
		case 0:
			genPhotoUploadResponse(req, res);
			break;
		case 1:
			getPhotoPrediction(req, res, target_path, photo_type);
			break;
		default :
			console.log('Unknown photo type: '+photo_type.toString());
			res.status(400).end('unknown photo type.');
	}
}


function saveUploadedPhoto(req, res, target_path) {

	var photoUploaded = new PhotoUpload();
	var photo_type;

	photoUploaded.userID = req.body.user_id;
	photoUploaded.dateTaken = parseDateFromDateStr(req.body.date);
	photoUploaded.imageQuestion = req.body.image_question;
	photoUploaded.expertReview = req.body.expert_review==='TRUE';
	photoUploaded.photoPath = target_path;

	if(req.body.photo_type) {
		//console.log('req.body.photo_type is '+req.body.photo_type);
		photo_type = Number(req.body.photo_type);
	} else {
		//console.log('photo_type not presented.');
		photo_type = undefined;
	}

	photoUploaded.save(function(err) {
		if(err) {
			console.log('Failed to save uploaded photo:', err.message);
			return res.end('failed to save photo');
		}

		if(photo_type === undefined) { // old version just return success.
			return res.end('success');
		}

		processUploadedPhoto(req, res, target_path, photo_type);
	}); //end save

	activity.saveUserActivity(photoUploaded.userID, 'upload photo', req);
}


function createUserDir(root_dir, user_dir){
	if (!fs.existsSync(root_dir)){
		fs.mkdirSync(root_dir);
	}

	if (!fs.existsSync(user_dir)){
		fs.mkdirSync(user_dir);
	}
}


function getRootDirForImages(){
	try {
		var stats = fs.lstatSync('development_server.txt');
		if (stats.isFile()) {
			return '/opt/data/';
		}
		else {
			return __dirname + '/../../public/images/';
		}
	} catch (e) {
		return __dirname + '/../../public/images/';
	}
}

function getRootDirForFile(){
	//try {
	//	var stats = fs.lstatSync('development_server.txt');
	//	if (stats.isFile()) {
	//		return '/opt/data/';
	//	}
	//	else {
	//		return __dirname + '/../../public/files/';
	//	}
	//} catch (e) {
	//	return __dirname + '/../../public/files/';
	//}
	return __dirname + '/../../public/files/';
}

exports.uploadPhoto = function(req, res) {

	// TODO: find a better place to save uploaded files.
	//var root_dir = __dirname + '/../../public/images/';
	var root_dir = getRootDirForImages();


	var photoInfo = req.files.photo_name;
	if(! photoInfo) {
		photoInfo = req.files.meal_photo;
	}

	if (! photoInfo) {
		return res.status(400).end('File upload failed. invalid photo information');
	}

	var tmp_path = photoInfo.path;
	var user_dir = root_dir + req.body.user_id;
	var target_path = user_dir + '/' + photoInfo.originalname;

	createUserDir(root_dir, user_dir);

	fs.rename(tmp_path, target_path, function(err) {
		if (err) {
			console.log('Failed to rename uploaded photo: ', err.message);
			return res.status(400).end('File upload failed.');
		}

		fs.unlink(tmp_path, function(){
			if (err) {
				console.log('Filed to unlink uploaded photo: ', err.message);
				return res.status(400).end('File upload failed...');
			}

			saveUploadedPhoto(req, res, target_path);
		}); //end unlink
	});// end rename
};


exports.uploadFiles = function(req, res) {

	// TODO: find a better place to save uploaded files.
	//var root_dir = __dirname + '/../../public/images/';
	var root_dir = getRootDirForFile();


	var fileInfo = req.files.file_name;

	if (! fileInfo) {
		return res.status(400).end('File upload failed. invalid photo information');
	}
	var tmp_path = fileInfo.path;
	var user_dir = root_dir + req.body.user_id;
	var target_path = user_dir + '/' + fileInfo.originalname;

	createUserDir(root_dir, user_dir);

	fs.rename(tmp_path, target_path, function(err) {
		if (err) {
			console.log('Failed to rename uploaded photo: ', err.message);
			return res.status(400).end('File upload failed.');
		}

		fs.unlink(tmp_path, function(){
			if (err) {
				console.log('Filed to unlink uploaded photo: ', err.message);
				return res.status(400).end('File upload failed...');
			}


			activity.saveUserActivity(req.body.user_id, 'upload file', req);
			res.send('OK');
		}); //end unlink
	});// end rename
};

function assemblePredictionResult2(req, res, predictions){


	var output = {};

	//output.photo_type = photo_type;
	getNutritionFacts(predictions, function(err, labels){
		if(err) {
			output.classficiation_status = 1;
		} else {
				output.classficiation_status = 0;


			output.lables={label:labels};

		}

		res.jsonp(output);
	});


}

function getFoodPrediction(req, res, photo_path) {

	//var base = '/var/www/GlucoGuide/production/current/services/entryPoint/public/images/55c5080e00dbf257afe98c4c';

	//var tmpPath = base + '/meal_20150902_124049.jpg';

		request.post(
		'http://kdd.csd.uwo.ca:9999/classifyimage',
		{form:{'photo_path':photo_path}},
		//{form:{'photo_path':tmpPath}},
		function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var prediction;
				try {
					prediction = JSON.parse(body);
				} catch (e) {
					console.log('enable to parse body:', e);
				}
				assemblePredictionResult2(req, res, prediction);
			}else{
				console.log('post request failed!');
				return res.status(400).end('Food prediction failed.' + JSON.stringify(error));
			}
		}
	);
}

function getDigitsPrediction2(req, res, photo_path) {
	var body = {uri:'/images/medical_digits/out/predictions.png'};

	res.jsonp(body);
}

function getDigitsPrediction(req, res, photo_path) {

	//var base = '/var/www/GlucoGuide/production/current/services/entryPoint/public/images/55c5080e00dbf257afe98c4c';

	//var tmpPath = base + '/meal_20150902_124049.jpg';

	request.get(
		{
			url:'http://localhost:9000/detection',
			qs: {
				image: photo_path
			}
		},
		function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var prediction;
				try {
					prediction = JSON.parse(body);
				} catch (e) {
					console.log('enable to parse body:', e);
				}

				res.jsonp(prediction);

			}else{
				console.log('failed to predict digits!');
				return res.status(400).end('failed to predict digits' + JSON.stringify(error));
			}
		}
	);
}

exports.foodRecognize = function(req, res) {

	// TODO: find a better place to save uploaded files.
	//var root_dir = __dirname + '/../../public/images/';
	var root_dir = getRootDirForImages();


	var photoInfo = req.files.photo;

	if (! photoInfo) {
		return res.status(400).end('File upload failed. invalid photo information');
	}

	var tmp_path = photoInfo.path;
	var user_dir = root_dir + 'recognize';

	var target_path = user_dir + '/' + photoInfo.originalname;

	createUserDir(root_dir, user_dir);

	fs.rename(tmp_path, target_path, function(err) {
		if (err) {
			console.log('Failed to rename uploaded photo: ', err.message);
			return res.status(400).end('File upload failed.');
		}

		fs.unlink(tmp_path, function(){
			if (err) {
				console.log('Filed to unlink uploaded photo: ', err.message);
				return res.status(400).end('File upload failed...');
			}

			getFoodPrediction(req, res, target_path);
		}); //end unlink
	});// end rename
};


exports.listAllDigitsImages = function(req, res) {
	var dir = getRootDirForImages();
	dir += 'medical_digits/out/';
	var base_uri = '/images/medical_digits/out/';

	fs.readdir(dir, function(err, files){
		files = files.map(function (fileName) {
			return {
				name: fileName,
				time: fs.statSync(dir + '/' + fileName).mtime.getTime()
			};
		})
			.sort(function (a, b) {
				return b.time - a.time; })
			.map(function (v) {
				return base_uri + v.name; });

		res.jsonp(files);
	});

	//var records = [];
	//fs.readdir(root_dir, function(err, items) {
	//	console.log(items);
	//	items.forEach(function(item) {
	//		records.push(base_uri+item);
	//	});
	//	res.jsonp(records);
	//});
};

exports.digitsRecognize = function(req, res) {

	// TODO: find a better place to save uploaded files.
	//var root_dir = __dirname + '/../../public/images/';
	var root_dir = getRootDirForImages();


	var photoInfo = req.files.file;
	console.log('req:'+JSON.stringify(req.files));

	if (! photoInfo) {
		return res.status(400).end('File upload failed. invalid photo information');
	}

	var tmp_path = photoInfo.path;
	var user_dir = root_dir + 'medical_digits';


	//var fileName = photoInfo.originalname.replace(/\s+/g, '');
	//console.log('image name:'+fileName)
    //
	//fileName = tmp_path.split;

	var target_path = user_dir + '/' + photoInfo.name;

	createUserDir(root_dir, user_dir);

	fs.rename(tmp_path, target_path, function(err) {
		if (err) {
			console.log('Failed to rename uploaded photo: ', err.message);
			return res.status(400).end('File upload failed.');
		}

		fs.unlink(tmp_path, function(){
			if (err) {
				console.log('Filed to unlink uploaded photo: ', err.message);
				return res.status(400).end('File upload failed...');
			}

			getDigitsPrediction(req, res, target_path);
		}); //end unlink
	});// end rename
};

