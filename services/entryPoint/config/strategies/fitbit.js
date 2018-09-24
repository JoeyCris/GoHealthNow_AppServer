'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller'),
    fitbit = require('../../app/controllers/records.fitbit.server.controller');

module.exports = function() {
	// Use facebook strategy
	console.log('url:' + config.fitbit.callbackURL);

	passport.use(new FitbitStrategy({
			clientID: config.fitbit.clientID,
			clientSecret: config.fitbit.clientSecret,
			callbackURL: config.fitbit.callbackURL,//,
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {

			// Set the provider data and include tokens
			var providerData = {}; //profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;
			providerData.id = profile.id;

			// Create the user OAuth profile
			//var email =  profile.displayName.toLowerCase().trim().replace(" ", ".") + '.' + profile.id + '@fitbit.com';
			//if(profile.emails && profile.emails.length >= 0) {
			//	email = profile.emails[0].value;
			//} else {
			//	email = 'f' + profile.id + '@fitbit.com';
			//}

			//var UserSchema = new Schema({
			//	firstName: {
			//		type: String,
			//		trim: true,
			//		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
			//	},
			//	lastName: {
			//		type: String,
			//		trim: true,
			//		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
			//	},
			//	email: {
			//		type: String,
			//		trim: true,
			//		unique: 'email already exists',
			//		required: 'Please fill in an email'
			//	},
			//	userName: {
			//		type: String,
			//		unique: 'Username already exists',
			//		required: 'Please fill in a username',
			//		trim: true
			//	},
			//	gender: {
			//		type: Number, //0: Male, 1: Female
			//		default: 0
			//	},
			//	dob: {
			//		type: Number,
			//		default: 1965
			//	},
			//	weight: {
			//		type: Number,
			//		default: 80
			//	},
			//	height: {
			//		type: Number,
			//		default:180
			//	},
			//	waistSize: {
			//		type: Number,
			//		default: 80
			//	},
			//	registrationTime: {
			//		type: Date,
			//		default: Date.now
			//	},
			//	provider: {
			//		type: String,
			//		required: 'Provider is required'
			//	},
			//	providerData: {},
			//	additionalProvidersData: {},
            //
			//	measureUnit: {
			//		type: Number,
			//		default: 0 //0：metric(kg,cm); 1: imperial(lbs,ft/in)
			//	},
			//	bGUnit: {
			//		type: Number,
			//		default: 0 //0：mmol/L; 1: mg/dL
			//	},
            //
			//	retrieveTime:{
			//		type: Date,
			//		default: Date.now
			//	}
			//},

			var providerUserProfile = {
				firstName: profile.displayName,
				lastName: profile.displayName,
				displayName: profile.displayName,
				//email: email,
				//userName: profile.username,
				provider: 'fitbit',
				providerIdentifierField: 'id',
				providerData: providerData,
				cbForNewUser:fitbit.retrieveLastMonthData,
				//cbForNewUser:fitbit.retrieveYesterdayData
				boundDevices: { fitbit: true }

			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);

		}
	));
};
