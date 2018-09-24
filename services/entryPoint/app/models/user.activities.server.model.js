/**
 * Created by robin on 17/07/15.
 */


var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserActivitiesSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	activityName: {
		type: String,
		enum:['sign up', 'sign in', 'upload record', 'upload photo', 'upload file', 'update profile', 'ask question', 'get recommendation']
	},
	activityTime: {
		type: Date,
		default: Date.now
	},
	ipAddress: {
		type: String
	},
	location: String
});
mongoose.model('UserActivities', UserActivitiesSchema);
