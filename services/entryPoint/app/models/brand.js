/**
 *
 * Created by Canon on 2016-02-04.
 */
'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var BrandSchema = new Schema({
	brandAccessCode: {
		type: String,
		required: true,
		unique: true
	},

	brandName: {
		type: String
	},

	homePage: String,
	logo: {
		type: String,
		required: true
	},

	createdDate: Date,
	lastModifiedDate: Date
});

mongoose.model('Brand', BrandSchema);

