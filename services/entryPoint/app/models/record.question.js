'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var NoteSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank',
		ref:'User'
	},
	uuid: String,
	noteContent: String,
	// noteType: Number, //0:'Diet', 1: 'Exercise', 2: 'BloodGlucose', 3: 'Weight', 4: 'Others'
	noteType: {
		type: String,
		enum: ['Diet', 'Exercise', 'Blood Glucose', 'Weight', 'Others']
	},
	recordedTime: Date
});

mongoose.model('Note', NoteSchema);


var QuestionSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank',
		ref:'User'
	},
	uuid: String,
	dietitianNotView: {
		type: Boolean,
		default: false
	},
	questionContent: {
		type: String,
		required: 'Content cannot be blank'
	},
	// noteType: Number, //0:'Diet', 1: 'Exercise', 2: 'BloodGlucose', 3: 'Weight', 4: 'Others'
	questionType: {
		type: String,
		enum: ['Diet', 'Exercise', 'Blood Glucose', 'Weight', 'Others'],
		required: 'Type cannot be blank'
	},
	noteAudio:String,
	medias:[ {
		uri: String,
		mimeType: {
			type: String,
			enum: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp']  //0: image/jpg
		}
	}],
	link: String,
	recordedTime: {
		type: Date,
		default: Date.now
	},
	replyTimes: {
		type: Number,
		default: 0
	}
});

mongoose.model('Question', QuestionSchema);


var PhotoUploadSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		required: 'userID cannot be blank',
		ref:'User'
	},
	dateTaken: Date,
	imageQuestion: String,
	expertReview: Boolean,
	photoPath: String
});

mongoose.model('PhotoUpload', PhotoUploadSchema);


