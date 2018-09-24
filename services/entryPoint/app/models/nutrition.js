'use strict';

/**
 *
 * Nutrition facts for food recognition.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NutritionFactsSchema = new Schema({
	name: {
		type: String,
		unique: 'Food name already exists',
		required: 'Please fill in a food name',
		trim: true
	},
	servingSize: String,
	calories: Number,
	carbs: Number,
	fat: Number,
	protein: Number,

	//saturatedFat:Number,
	//transFat: Number,
	//sodium: Number,
	//fibre: Number,
	//sugars: Number,
	//iron: Number,
	//servingSize: Number,
});
mongoose.model('NutritionFacts', NutritionFactsSchema);
