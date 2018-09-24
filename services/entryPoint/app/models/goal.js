/**
 * Created by robert on 13/06/16.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var WeightGoalSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: {
		type: String
	},
	type: {
		type: Number //0: lose weight; 1: gain weight
	},
	target:{
		type: Number
	},
	targetEnum:{
		type: Number //0: lose 0.2 kg; 1: lose 0.5
//<option value="0">Lose 0.2 kg per week</option>
//<option value="1">Lose 0.5 kg per week</option>
//<option value="2">Lose 0.8 kg per week</option>
//<option value="3">Lose 1 kg per week</option>
//<option value="4">Maintain weight</option>
//<option value="5">Gain 0.2 kg per week</option>
//<option value="6">Gain 0.5 kg per week</option>
//<option value="7">Gain 0.8 kg per week</option>
//<option value="8">Gain 1 kg per week</option>
	},
	recordedTime: Date
});

mongoose.model('WeightGoal', WeightGoalSchema);

var ExerciseGoalSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: {
		type: String
	},
	type: {
		type: Number, //0: Light; 1: Moderate/Vigorous; 2: Daily step count; 3: Weekly step count
		default: 0
	},
	target: Number,
	recordedTime: Date
});

mongoose.model('ExerciseGoal', ExerciseGoalSchema);


var MacrosGoalSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: {
		type: String
	},
	carbs: {
		type: Number, //0.5
		default: 0.5
	},
	protein: {
		type: Number, //0.2
		default: 0.2
	},
	fat:{
		type: Number, //0.3
		default: 0.3
	},
	recordedTime: Date
});

mongoose.model('MacrosGoal', MacrosGoalSchema);


var BloodGlucoseGoalSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: {
		type: String
	},
	type: {
		type: Number, //0: lower bound; 1: upper bound
		default: 0
	},
	target: Number,
	// upperBound: Number,
	// lowerBound: Number,
	recordedTime: Date
});

mongoose.model('BloodGlucoseGoal', BloodGlucoseGoalSchema);
