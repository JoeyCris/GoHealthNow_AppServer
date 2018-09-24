/**
 * Created by robertwang on 2016-06-20.
 */
'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
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
		logType: Number, //<!--0:AutoEstimate, 1:Search, 2:UPC, 3:UserDefinedFoodItem,  4: online search from FatSecret, 5: online search from NutritioniX-->
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
		enum: ['Search', 'QuickEstimate', 'UPC', 'User Defined', 'Online Search']
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

var GlucoseSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	level: Number,
	glucoseType: Number,  	//0: before breakfast, 1: after breakfast, 2: before lunch,
	// 3: after lunch, 4: before dinner, 5: after dinner, 6: bedtime, 7: other.
	uploadingVersion: Number,
	note: String,
	recordedTime: Date
});
mongoose.model('Glucose', GlucoseSchema);

var SleepSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	minutes: Number,
	sick: Boolean,
	stressed: Boolean,
	note: String,
	recordedTime: Date

});

SleepSchema.index({ userID: 1, recordedTime: -1 });

mongoose.model('Sleep', SleepSchema);


var ExerciseSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	exerciseRecordType: Number, //0 from manual input, 1 from pedometer, 2 from fitbit
	exerciseStartingTime: Date, //Starting time
	stepCount: Number,
	minutes: Number,
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


var WeightSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank',
		ref:'User'
	},
	uuid: String,
	weightValue: Number,
	note: String,
	recordedTime: Date
});

mongoose.model('Weight', WeightSchema);

var A1CSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank',
		ref:'User'
	},
	uuid: String,
	a1CValue: Number,
	note: String,
	recordedTime: Date
});

mongoose.model('A1C', A1CSchema);



var InsulinTypeSchema = new Schema({
	insulinID: {
		type: String,
		unique: 'insulinID already exists',
	},
	type: Number,
	name: String
});

mongoose.model('InsulinType', InsulinTypeSchema);


var InsulinSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	insulinID: {
		type: Schema.Types.ObjectId,
		ref: 'InsulinType'
	},
	dose: Number,
	note: String,
	recordedTime: Date
});

mongoose.model('Insulin', InsulinSchema);

var MedicineTypeSchema = new Schema({
	medicineID: {
		type: String,
		unique: 'medicineID already exists'
	},
	isCommon: Boolean,
	type: Number,
	name: String
});

mongoose.model('MedicineType', MedicineTypeSchema);


var MedicineSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	medicineID: {
		type: Schema.Types.ObjectId,
		ref: 'MedicineType'
	},
	medicineName: String,
	dose: Number,
	unit: String,
	note: String,
	recordedTime: Date
});

mongoose.model('Medicine', MedicineSchema);

var BloodPressureSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: String,
	systolic: Number,
	diastolic: Number,
	pulse: Number,
	note: String,
	recordedTime: Date
});

mongoose.model('BloodPressure', BloodPressureSchema);

