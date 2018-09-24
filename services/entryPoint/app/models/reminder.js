/**
 * Created by robert on 03/03/16.
 */

'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ReminderSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank'
	},
	uuid: {
		type: String
	},
	reminderType:{
		type: Number //<!-- 0:Medication, 1:BloodGlucose, 2:Exercise, 3: Meal-->

	},

	repeatType:{
		type: Number //<!-- 0 for once, 1 for daily -->
	},
	reminderTime: {
		type: Date
	},
	parameters:Object,
	recordedTime: Date
});


//Parameters of BloodGlucose:
//	<Parameters>
//<GlucoseType>1</GlucoseType> <!-- 0: before breakfast, 1: after breakfast, 2: before lunch, 3: after lunch, 4: before dinner, 5: after dinner, 6: bedtime, 7: other. -->
//</Parameters>
//
//Parameters of Exercise:
//	<Parameters>
//<ExerciseType>0</ExerciseType><!-- 0 for light, 1 for moderate, 2 for vigorous -->
//</Parameters>
//
//Parameters of Meal:
//	<Parameters>
//<MealType>1</MealType> <!-- 0 for snack, 1 for breakfast, 2 for lunch, 3 for supper -->
//</Parameters>


mongoose.model('Reminder', ReminderSchema);

