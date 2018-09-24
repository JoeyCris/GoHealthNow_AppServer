'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ExerciseSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	exerciseRecordType: Number, //0 from manual input, 1 from pedometer
	exerciseStartingTime: Date, //Starting time
	stepCount: Number,
	minutes: Number,
	// type:  Number, //0: 'Light', 1: 'Moderate', 2: 'Vigorous'
	type: {
		type: String,
		enum: ['Light', 'Moderate', 'Vigorous']
	},
	interval: Number,
	calories: Number,
	note: String,
	recordedTime: Date

});

mongoose.model('Exercise', ExerciseSchema);
