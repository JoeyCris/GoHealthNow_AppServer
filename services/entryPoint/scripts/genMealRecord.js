/**
 * Created by nodejs on 04/09/15.
 */

var mongoose = require('mongoose'),
	ObjectId = require('mongoose').Types.ObjectId,
	Schema = mongoose.Schema;

var fs = require("fs");

if(process.argv.length < 5) {
	console.log('usage: node genDemoRecord.js api/test/local month day');
	process.exit(-1);
}

process.argv.forEach(function (val, index, array) {
	console.log(index + ': ' + val);

});


//var day = 26;
//var month = 07;

var month = process.argv[3] - 1;
var day = Number(process.argv[4]);


var config = {
	api:{
		//svrURL:'http://localhost:3000/GlucoGuide/Write',
		svrURL:'https://api.glucoguide.com/GlucoGuide/Write',
		user:'55c5080e00dbf257afe98c4c'
	},
	local:{
		svrURL:'http://localhost:3000/GlucoGuide/Write',
		user:'55c5080e00dbf257afe98c4c'
	},
	test:{
		svrURL:'https://test.glucoguide.com/GlucoGuide/Write',
		user:'559d7f081f1f2c42758f5f02' //demo: 559d7f081f1f2c42758f5f02 john: 55cacc98289cc1a162a61b04
	}

}
//var svrURL = 'http://localhost:3000/GlucoGuide/Write';
var svrURL = config[process.argv[2]].svrURL;
//var user = '55c5080e00dbf257afe98c4c'; //localhost
var user = config[process.argv[2]].user; //test.glucoguide.com

console.log('url:' + svrURL);
console.log('user:' + user);
console.log('month:' + month);
console.log('day:' + day);

mongoose.connect('mongodb://localhost/rawdata');

function generateUUID(){
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
};

//var model = require('../../services/entryPoint/app/models/nutrition');
var FoodItemSchema = new Schema({
	_id: Number,
	id: { type: Number, unique: true },
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
		convFac: Number }]
});

var FoodItem = mongoose.model('FoodItem', FoodItemSchema);

var MealSchema = new Schema({
	userID: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: 'userID cannot be blank'
	},
	food: [{
		itemID: {type : Number, ref: 'FoodItem' },
		servingSize: Number,
		convFac: Number,
		servingSizeName: String,
		logType: Number,
		photoName: String,
		carb: Number,
		pro: Number,
		fibre: Number,
		fat: Number,
		cals: Number,
	}],

	//food:[{ type : Schema.Types.ObjectId, ref: 'FoodItem' }],
	carb: Number,
	fibre: Number,
	pro: Number,
	fat: Number,
	cals: Number,
	mealType: {
		type: String,
		enum: ['Snack', 'Breakfast', 'Lunch', 'Supper']
	},
	mealEnterType: {
		type: String,
		enum: ['Search', 'QuickEstimate']
	},
	mealName: String,
	mealScore: Number,
	mealPhoto: String,
	deviceMealID: String,
	recordedTime: {
		type: Date,
		default: Date.now
	},
	replyTimes: {
		type: Number,
		default: 0
	}
});

var Meal = mongoose.model('Meal', MealSchema);


var genXmlOutput =  require('../app/utils/genxmloutput.js'),
	request = require('request');



/*
Meal.aggregate(
	[
		{
			$match : {userID:ObjectId("55c5080e00dbf257afe98c4c"),
				recordedTime:{$gt:new Date("2015-08-25T04:00:00Z"),
					$lt:new Date("2015-08-30T04:00:00Z")}}
		},
		{
			$group : {
				_id : {
					year: { $year : '$recordedTime'},
					month: { $month : '$recordedTime' },
					day: { $dayOfMonth : '$recordedTime'}
				}
			}
		},
		{
			$sort : { _id: -1}
		},
		{
			$limit:3
		}
	],


	function (err, data) {
		if (err) {
			console.log(err);
		} else {

			console.log(JSON.stringify(data));
			//statistics.activeUserStats = data;
			//callback(null);
		}
	});

*/

var sendMealToServer= function(newMeal, isFinished, index) {
	var req = {
		userID: user,
		meal_Records:newMeal,
		created_Time: new Date()
	};

	//console.log(JSON.stringify(newMeal));
	var xml = genXmlOutput('user_Record', req);
//res.end(xml);
	//console.log(xml);

	//fs.writeFile('req'+JSON.stringify(index) + '.xml', xml, function (err) {
	//	if (err) throw err;
	//	console.log('It\'s saved!');
	//});

	console.log(xml);

	request.post(svrURL, {form:{userRecord:xml}},
		function (error, response, body) {
			if(error) {
				console.log('failed to add records');
				console.log(JSON.stringify(error));
				console.log(JSON.stringify(response));
			} else {
				console.log(JSON.stringify(body));

				if(isFinished) {
					mongoose.connection.close();
				}

			}
		});

}

//db.meals.remove({userID:ObjectId("55c5080e00dbf257afe98c4c"), recordedTime:{$gt:ISODate("2015-09-01T04:00:00Z")}})

//db.useractivities.remove({user:ObjectId("55c5080e00dbf257afe98c4c"),activityName:"upload record",activityTime:{$gt: ISODate("2015-08-31T23:54:37.987Z")}})


var offset = Math.ceil((new Date(2015, month, day) - new Date(2015, 7, 25))/3600/1000/24);

//console.log('offset:'+offset);

Meal.find({userID:ObjectId("55c5080e00dbf257afe98c4c"),
	recordedTime:{$gt:new Date("2015-08-24T04:00:00Z"),
	$lt:new Date("2015-09-01T10:00:00Z")}}).populate('food.itemID').exec( function(err, data) {
	if(err) {
		console.log(err);
	} else if(data) {

		var newMeal = {
			meal_Record:[

			]
		};

		var mealType = {'Snack':0, 'Breakfast':1, 'Lunch':2, 'Supper':3 };
		var logType = {'Search':1, 'QuickEstimate':0};
		data.forEach(function(row, index) {

			//var dt = row.recordedTime.getDay();

			var record = {
				carb: row.carb,
				pro: row.pro,
				fat: row.fat,
				cals: row.cals,
				fibre: 0,
				mealType:mealType[row.mealType], //breakfast
				mealEnterType:logType[row.mealEnterType],
				mealPhoto:row.mealPhoto,
				deviceMealID:generateUUID(),
				food_Records:{
					food_Record: [
					]
				},
				recordedTime: new Date(2015, row.recordedTime.getMonth(), row.recordedTime.getDate() + offset, row.recordedTime.getHours(), row.recordedTime.getMinutes() )
			};

			//console.log(JSON.stringify(record.recordedTime));

			var fibre = 0;

			if(row.mealEnterType === 'Search') {
				row.food.forEach(function(fooditem) {

					//if(!fooditem.convFac) {
						var name = '';
						name = fooditem.servingSizeName.trim();
						if(fooditem && fooditem.itemID) {
							if(fooditem.itemID.servingSizeOptions) {
								fooditem.itemID.servingSizeOptions.forEach(function(option) {
									var foodName = '';
									foodName = option.name.trim();
									//console.log(' serving name: "' + name +'"');
									//console.log('food: "' + foodName+'"');
									if(JSON.stringify(foodName) === JSON.stringify(name)) {
										fooditem.convFac = option.convFac;
										fooditem.servingSizeID = option.ssid;
										//console.log(' convFac: ' + JSON.stringify(fooditem.convFac));
									}
								});
							}

						}
					//}


					var newFood = {
						foodItem: {
							foodItemID: fooditem.itemID.id
						},
						foodItemServingSize: fooditem.servingSize,
						servingSizeID: fooditem.servingSizeID,
						foodItemLogType: 1,
						//foodItemPhoto:'meal_20150901_164618.jpg',
						//carb: fooditem.itemID.carbs *fooditem.servingSize * fooditem.convFac,
						//pro: fooditem.itemID.protein *fooditem.servingSize * fooditem.convFac,
						//fat: fooditem.itemID.fat *fooditem.servingSize * fooditem.convFac,
						//fibre:fooditem.itemID.fibre *fooditem.servingSize * fooditem.convFac,
						//cals: fooditem.itemID.calories *fooditem.servingSize * fooditem.convFac
					};

					fibre += fooditem.itemID.fibre *fooditem.servingSize * fooditem.convFac;

					record.food_Records.food_Record.push(newFood);



				});

				record.fibre = fibre;

			} else {
				//record.food_Records.food_Record.push( {
                //
				//	foodItemLogType: 0,
				//	foodItemPhoto: row.mealPhoto,
				//	carb: row.carb,
				//	pro: row.pro,
				//	fat: row.fat,
				//	cals: row.cals,
				//});
                //
				//record.fibre = undefined;
			}



			newMeal.meal_Record.push(record);

			if(((index % 20) === 0) || (index === data.length - 1)) {
				sendMealToServer(newMeal, index === data.length - 1, index);
				newMeal.meal_Record = [];
			}


		});



	}
});



