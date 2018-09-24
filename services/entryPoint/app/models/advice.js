'use strict';

/**
 * Created by robin liu on 15-05-14.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AdviceSchema = new Schema({
	createdTime: Date,
	content: String,
	expertSignature: String,
	imageURL: String,
	URL: String, //URL for tips
	type:Number
});

mongoose.model('Advice', AdviceSchema);
