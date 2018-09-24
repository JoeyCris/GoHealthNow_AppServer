'use strict';

/**
 * Created by robertwang on 15-06-18.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//FatSecret Food item
var FSFoodItemSchema = new Schema({
	itemID: { type: Number, unique: true },
	upc: { type: String },
	name: String,
	category: String,
	servings: {
		ids:Object,//{ servingID:options[index] }
		options:[{
			servingID: Number,
			name: String,
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
		}]
	}
});
mongoose.model('FSFoodItem', FSFoodItemSchema);

//NutritionX Food item
var NXFoodItemSchema = new Schema({
	itemID: { type: String, unique: true },
	upc: { type: String },
	name: String,
	category: String,
	servings: {
		ids:Object,//{ servingID:options[index] }
		options:[{
			servingID: Number,
			name: String,
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
		}]
	}
});
mongoose.model('NXFoodItem', NXFoodItemSchema);

var FoodItemSchema = new Schema({
	_id: Number,
	id: { type: Number, unique: true },
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
mongoose.model('FoodItem', FoodItemSchema);
