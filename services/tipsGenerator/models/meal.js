'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var MealSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: 'userID cannot be blank'
	},
	food: [{
		itemID: {type : Number},
		name:String,
		servingSize: Number,
		ssid: Number,
		servingSizeName: String,
		logType: Number,
		photoName: String,
		carb: Number,
		pro: Number,
		fibre: Number,
		fat: Number,
		cals: Number,
	}],

	//food:[{ type : Schema.Types.ObjectId, ref: 'FoodItem' }],
	carb: Number,
	fibre: Number,
	pro: Number,
	fat: Number,
	cals: Number,
	mealType: {
		type: String,
		enum: ['Snack', 'Breakfast', 'Lunch', 'Supper']
	},
	mealEnterType: {
		type: String,
		enum: ['Search', 'QuickEstimate', 'UPC']
	},
	mealName: String,
	mealScore: Number,
	mealPhoto: String,
	uuid: String,
	recordedTime: {
		type: Date,
		default: Date.now
	},
	replyTimes: {
		type: Number,
		default: 0
	},
	note: String
});

mongoose.model('Meal', MealSchema);
