'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
	olduserID: Number,
	firstName: {
		type: String,
		trim: true,

	},
	lastName: {
		type: String,
		trim: true,

	},
	userID: {
		type: String,
		unique: 'userID already exists',

	},
	email: {
		type: String,
		trim: true,
		unique: 'email already exists',
		required: 'Please fill in an email'
		//default: '',
		//validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		//match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	userName: {
		type: String,
		unique: 'Username already exists',
		required: 'Please fill in a username',
		trim: true
	},
	gender: {
		type: Number, //0: Male, 1: Female
		default: 0
	},
	//{
	//	type: String,
	//	enum: ['Male', 'Female']
	//},
	dob: {
		// type: Date,
		// default: new Date('1965')
		type: Number,
		default: 1965
	},
	weight: {
		type: Number,
		default: 80
	},
	height: {
		type: Number,
		default:180
	},
	waistSize: {
		type: Number,
		default: 80
	},
	accessCode: String,
	//bmi: Number,
	registrationTime: {
		type: Date,
		default: Date.now
	},
	extend: Object,
	password: {
		type: String,
		default: '',
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin', 'dietitian', 'orgAdmin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},

	/* For email verificaiton */
	emailVerificationToken: {
		type: String
	},
	emailVerified: {
		type: Boolean,
		default: false
	},
	/* For email unsubscription */
	sendEmail:{
		type: Boolean,
		default: true
	},

	registrationID: String,
	deviceType: {
		type:  Number,
		default: 0
	},

  points: {
  	type: Number,
  	default: 0
  },

	targetCalories: {
		type: Number,
		default: 0
	},

	targetWeightGoal: {
		type: Number,
		default: 0
	},

	activityLevel: {
		type: Number,
		default: 1.2
	},

	rightsMask: {
		type: Number,
		default: 770// 700: disable for DEC, 999: super user
	},

  //promoteMessage: String,

  updatedTime: {
  	type: Date,
  	default: Date.now
  },

  lastLoginTime: {
  	type: Date,
  	default: Date.now
  },
	measureUnit: {
		type: Number,
		default: 0 //0：metric(kg,cm); 1: imperial(lbs,ft/in)
	},
	bGUnit: {
		type: Number,
		default: 0 //0：mmol/L; 1: mg/dL
	},

	retrieveTime:{
		type: Date,
		default: Date.now
	}
});


mongoose.model('User', UserSchema);
