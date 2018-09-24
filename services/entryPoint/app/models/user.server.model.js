'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	//return ((this.provider !== 'local' && !this.updated) || property.length);
	return true;
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	//return (this.provider !== 'local' || (password && password.length > 6));
	return true;
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	olduserID: Number,
	firstName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	userID: {
		type: String,
		unique: 'userID already exists',
		required: 'Please fill in an userID'
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
		validate: [validateLocalStrategyPassword, 'Password should be longer']
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
		default: 0 // 0: Android, 1: iOS
	},
	appID: {
		type:  Number,
		default: 0 // 0: GlucoGuide, 1: GoHealthNow
	},

  //points: {
  //	type: Number,
  //	default: 10000
  //},

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

	conditions:{
		condition:{type:[Number]}//0: Diabetes, Prediabetes, 1: High Blood Pressure, 2: Overweight
	},

	ethnicity:{
		type: Number, //0: White/Caucasian, 1: Black/Afro-Caribbean), 2: Asian, 3: Aboriginal/American Indian, 4: Hispanic or Latino, 5: Other
		default: 5
	},

	mealDistribution:{
		breakfast: { type: Number, default: 25 },
		lunch: { type: Number, default: 25 },
		dinner: { type: Number, default: 25 },
		snacks: { type: Number, default: 25 }
	},

	rightsMask: {
		type: Number,
		default: 770// 700: disable for DEC, 999: super user
	},

  sponsorUID: String,

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

	inputSelection: {},
	boundDevices: {},

	language: {
		type: Number, //0: English, 1: French
		default: 0
	},

	retrieveTime:{
		type: Date,
		default: Date.now
	}
},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	});

UserSchema.virtual('bmi').get(function() {
	//return this.name.first + ' ' + this.name.last;

	var result = 0;

	if(this.height && this.height > 0 && this.weight) {
		result = (this.weight)/(this.height*this.height/10000);
	}

	return result.toFixed(1);

});



/**
 * Hook a pre save method to hash the password
 */
//UserSchema.pre('save', function(next) {
//	if (!this.userID) {
//		this.userID = this._id;
//	}
//
//	next();
//});



//UserSchema.pre('save', function(next) {
//	if (this.password && this.password.length >= 6) {
//		this.salt = crypto.randomBytes(16).toString('base64');
//		this.password = this.hashPassword(this.password);
//	}
//
//	next();
//});
//UserSchema.path('accessCode').set(function(value) {
//	this.vat = value * 0.21;
//	this.totalIncludingVat = value * 1.21;
//	return value;
//});
//
//UserSchema.path('accessCode').get(function() {
//	this.accessCode = value * 0.21;
//	this.totalIncludingVat = value * 1.21;
//	return value;
//});
//
//UserSchema.virtual('rightsMask').get(function() {
//
//});
//
//UserSchema.virtual('rightsMask').set(function(value) {
//	this.accessCode = value;
//});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		userName: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

UserSchema.methods.encryptPassword = function() {
	//console.log(this.salt);
	this.salt = crypto.randomBytes(16).toString('base64');
	this.password = this.hashPassword(this.password);
};

mongoose.model('User', UserSchema);
