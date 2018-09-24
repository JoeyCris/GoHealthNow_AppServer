'use strict';

/**
 * Created by robertwang on 15-06-18.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var UserFoodItemSchema = new Schema({
	_id: String,
  userID: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: 'userID cannot be blank'
	},
  uuid: String,
  foodPhoto: String,
	id: { type: String, unique: true },
	upc: { type: String, unique: true },
	hierarchy: String,
	subhierarchy: String,
	name: String,
	label:Number,
	calories: Number,
	fat: Number,
	saturatedFat:Number,
	transFat: Number,
	sodium: Number,
	carbs: Number,
	fibre: Number,
	sugars: Number,
	protein: Number,
	iron: Number,
	servingSizeOptions: [ {
		_id: Number,
		ssid: Number,
		name: String,
		convFac: Number,
		calories: Number,
		fat: Number,
		saturatedFat:Number,
		transFat: Number,
		sodium: Number,
		carbs: Number,
		fibre: Number,
		sugars: Number,
		protein: Number,
		iron: Number
	}],
	ranking: Number  // added by robin for global food popularity ranking.
});
mongoose.model('UserFoodItem', UserFoodItemSchema);
