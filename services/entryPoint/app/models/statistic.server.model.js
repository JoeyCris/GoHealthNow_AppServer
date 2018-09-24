'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Statistic Schema
 */
var StatisticSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Statistic name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Statistic', StatisticSchema);