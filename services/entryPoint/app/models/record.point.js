'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var PointSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank',
		ref:'User'
	},
	uuid: String,
	value: Number,
	// type: Number, //0:'WeeklyPoint', 1: 'WeeklyExercisePoint', 2: 'WeeklyMealPoint'
	type: {
		type: String,
		enum: ['TotalPoint', 'ExercisePoint', 'MealPoint']
	},
	frequency:{
		type: String,
		enum: ['Weekly', 'Daily', 'Monthly']
	},
	recordedTime: Date
});

mongoose.model('Point', PointSchema);
