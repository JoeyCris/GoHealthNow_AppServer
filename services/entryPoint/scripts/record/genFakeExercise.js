/**
 * Created by Canon on 2016-02-12.
 */

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rawdata');

require('../../app/models/record.log_view');
var Exercise = mongoose.model('Exercise');
var ObjectId = mongoose.Schema.Types.ObjectId;

var exerciseSample = [
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 177.75 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 316 },
	{ "minutes" : 390, "type" : "Vigorous", "interval" : 0, "calories" : 4108 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 146.25 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 260 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 260 },
	{ "minutes" : 40, "type" : "Light", "interval" : 0, "calories" : 69 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 139.5 },
	{ "minutes" : 270, "type" : "Vigorous", "interval" : 0, "calories" : 2232 },
	{ "minutes" : 30, "type" : "Light", "interval" : 0, "calories" : 69.75 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 209.25 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 395.25 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 139.5 },
	{ "minutes" : 30, "type" : "Light", "interval" : 0, "calories" : 46.5 },
	{ "minutes" : 34, "type" : "Moderate", "interval" : 0, "calories" : 158.1 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 219.4254 },
	{ "minutes" : 45, "type" : "Moderate", "interval" : 0, "calories" : 329.1381 },
	{ "minutes" : 46, "type" : "Moderate", "interval" : 0, "calories" : 336.45227 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 234 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 290.2992 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 119.25 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 219.4254 },
	{ "minutes" : 20, "type" : "Moderate", "interval" : 0, "calories" : 146.2836 },
	{ "minutes" : 60, "type" : "Moderate", "interval" : 0, "calories" : 238.5 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 206.83812 },
	{ "minutes" : 30, "type" : "Light", "interval" : 0, "calories" : 56.25 },
	{ "minutes" : 30, "type" : "Vigorous", "interval" : 0, "calories" : 318.75 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 219.4254 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 116.34644 },
	{ "minutes" : 60, "type" : "Moderate", "interval" : 0, "calories" : 232.69289 },
	{ "minutes" : 210, "type" : "Vigorous", "interval" : 0, "calories" : 3094 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 234 },
	{ "minutes" : 100, "type" : "Moderate", "interval" : 0, "calories" : 387.82147 },
	{ "minutes" : 60, "type" : "Light", "interval" : 0, "calories" : 93 },
	{ "minutes" : 60, "type" : "Moderate", "interval" : 0, "calories" : 279 },
	{ "minutes" : 45, "type" : "Moderate", "interval" : 0, "calories" : 174.51967 },
	{ "minutes" : 24, "type" : "Vigorous", "interval" : 0, "calories" : 169.825 },
	{ "minutes" : 30, "type" : "Moderate", "interval" : 0, "calories" : 189 },
	{ "minutes" : 30, "type" : "Light", "interval" : 0, "calories" : 63 },
	{ "minutes" : 20, "type" : "Vigorous", "interval" : 0, "calories" : 218.484 }
];

var userID = '558466f4673f54f02f8da687';

var startDate = new Date('2015-08-01');
var endDate = new Date('2015-12-31');
var len = exerciseSample.length;

var addExerciseData = function () {
	if(startDate <= endDate) {
		var currentExercise = exerciseSample[Math.floor(Math.random() * len)];
		currentExercise.recordedTime = new Date(startDate.toISOString());
		currentExercise.userID = userID;
		currentExercise = JSON.parse(JSON.stringify(currentExercise));

		Exercise.create(currentExercise, function(err){
			if(err) {
				console.log(err);
			}
			console.log(currentExercise);
			startDate.setDate(startDate.getDate()+1);
			addExerciseData();
		});

	} else {
		console.log('all data added');
		process.exit(0);
	}
};

addExerciseData();

