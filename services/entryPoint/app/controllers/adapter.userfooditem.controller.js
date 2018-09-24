'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Food = mongoose.model('UserFoodItem'),
	Rms = require('../utils/rms.js'),
	_ = require('lodash'),
	ObjectId = mongoose.Types.ObjectId;

var genXmlOutput =  require('../utils/genxmloutput.js');

var toLowerCase = function (name){
	return name.charAt(0).toLowerCase() + name.slice(1);
};
console.log('Session ID: ');
console.log(process.env.NODE_APP_INSTANCE);

var hexToDec = function(s) {
    var i, j, digits = [0], carry;
    for (i = 0; i < s.length; i += 1) {
        carry = parseInt(s.charAt(i), 16);
        for (j = 0; j < digits.length; j += 1) {
            digits[j] = digits[j] * 16 + carry;
            carry = digits[j] / 10 | 0;
            digits[j] %= 10;
        }
        while (carry > 0) {
            digits.push(carry % 10);
            carry = carry / 10 | 0;
        }
    }
    return digits.reverse().join('');
};


var objectIdTo64BitId = function(objectId){
  // objectId = new ObjectId();
  // console.log(objectId);
  var strId = objectId.toString();
  // console.log(strId);
  var randomNumber = Math.round(Math.random()*256);
  if((typeof process.env.NODE_APP_INSTANCE !== 'undefined')){
    randomNumber = process.env.NODE_APP_INSTANCE;
  }
  var hexString = randomNumber.toString(16);
  if(hexString.length  === 1)
    hexString = '0'+hexString;
  var str = strId.substr(0,8) + hexString + strId.substr(18, 24);
  // var id = parseInt(str,16);
  var id = hexToDec(str);
  console.log('FoodIdString: '+str+', FoodId: '+id);
  // console.log(id);
  return id;
};

/**
 * Add user's detailed records
 */
var addOneUserFoodItem = function(userID, data, res, callback, isLast){
  var food = new Food(data);
  food.userID = userID;

  food.servingSizeOptions = [];
  var servingSizeOption = {};
  servingSizeOption.ssid = 1000000;
  servingSizeOption.name = '1 Unit';
  servingSizeOption.convFac = 1;
  food.servingSizeOptions.push(servingSizeOption);
  console.log(data);
  if(data.foodID){
    food._id = data.foodID;
    food.id = food._id;
    food.upc = food._id;
    console.log('in update');
    Food.findByIdAndUpdate(food._id,{$set: food}, {upsert:false}, function(err,dbData){
  		if(err) {
  			console.error(JSON.stringify(err));
  			console.error('failed to add user defined food:' + JSON.stringify(food));
  			console.error('userID:' + JSON.stringify(userID) + ' Type: UserFoodItem data:' + JSON.stringify(data) );

  			callback(err, dbData);
  		} else {
        console.log(dbData);
  			callback(null, dbData, isLast);
  		}
  	});
  }else{
    food.upc = objectIdTo64BitId(new ObjectId());
    food._id = food.upc;
    // food._id = objectIdTo64BitId(new ObjectId());
    food.id = food._id;
    // food.upc = food._id;
    console.log('in save');
    Food.findByIdAndUpdate(food._id,{$set: food}, {upsert:true}, function(err,dbData){
  		if(err) {
  			console.error(JSON.stringify(err));
  			console.error('failed to add user defined food:' + JSON.stringify(food));
  			console.error('userID:' + JSON.stringify(userID) + ' Type: UserFoodItem data:' + JSON.stringify(data) );

  			callback(err, dbData);
  		} else {
  			callback(null, dbData, isLast);
  		}
    });
  }
};

// exports.addUserFoodItem = function(req, res) {
//
// 	var xml = req.body.UserFoodItem;
// 	var parseString = require('xml2js').parseString;
//   var foodItems = [];
//
//
// 	parseString(xml, {
// 		tagNameProcessors: [toLowerCase],
// 		explicitArray: false,
// 		trim: true
// 	}, function (err, result) {
// 		if (err) {
// 			console.log('Failed to parse string to xml, invalid xml',err.message);
// 			// TODO: better return value for client
// 			return res.status(400).send('Invalid XML');
// 		}
//
// 		//result.user_Record.userID
// 		if(!result || !result.userDefinedFood || !ObjectId.isValid(result.userDefinedFood.userID)) {
// 			console.log('Failed to parse string to xml, invalid xml');
// 			// TODO: better return value for client
// 			return res.status(400).send('Invalid XML');
// 		}
// 		else if(result.userDefinedFood.foodItems) {
//       // console.log(result.userDefinedFood);
//       var userID = result.userDefinedFood.userID;
//       var foods = result.userDefinedFood.foodItems.foodItem;
//       var callback = function(err, foodItem, isLast){
//         if(err){
//           console.log('Error in UserFoodItem.create: ', err.message);
//           return res.status(400).send({
//             message: errorHandler.getErrorMessage(err)
//           });
//         }else{
//           foodItem._id = undefined;
//           foodItem.__v = undefined;
//           foodItem.userID = undefined;
//           foodItem.upc = undefined;
//           // console.log(foodItem);
//           foodItems.push(foodItem);
//         }
//         if(isLast){
//           var resultValue = {
//             userID: userID,
//             foodItems: {
//               foodItem: foodItems
//             }
//           };
//   				res.send(genXmlOutput('UserDefinedFood',resultValue));
//           // res.json(foodItemIDs);
//         }
//       };
//       if( Object.prototype.toString.call( foods ) === '[object Array]') {
//     		foods.forEach( function(data, index) {
//     			var isLast = index === foods.length-1;
//     			addOneUserFoodItem(userID, data, res, callback, isLast);
//     		});
//     	} else {
//     		addOneUserFoodItem(userID, foods, res, callback, true);
//     	}
//     }
//
// 	});
// };

exports.addUserFoodItem = function(req, res) {

	var xml = req.body.UserFoodItem;
	var parseString = require('xml2js').parseString;


	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		if (err) {
			console.log('Failed to parse string to xml, invalid xml',err.message);
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}

		//result.user_Record.userID
		if(!result || !result.userDefinedFood || !ObjectId.isValid(result.userDefinedFood.userID)) {
			console.log('Failed to parse string to xml, invalid xml');
			// TODO: better return value for client
			return res.status(400).send('Invalid XML');
		}
		else if(result.userDefinedFood.foodItem) {
      // console.log(result.userDefinedFood);
      var userID = result.userDefinedFood.userID;
      var food = result.userDefinedFood.foodItem;
      var callback = function(err, foodItem, isLast){
        if(err){
          console.log('Error in UserFoodItem.create: ', err.message);
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }else if(foodItem === null){
          console.error('Cannot find foodItem');
          return res.status(400).send({
            message: 'Cannot find foodItem'
          });
        }{
          foodItem._id = undefined;
          foodItem.__v = undefined;
          foodItem.userID = undefined;
          foodItem.upc = undefined;
          var resultValue = {
            foodID: foodItem.id,
            servingSizeID: foodItem.servingSizeOptions[0].ssid
          };
          res.send(genXmlOutput('UserDefinedFood',resultValue, { 'pretty': false, 'indent': '', 'newline': '' }));
          // res.end(foodItem.id.toString());
        }
      };
    	addOneUserFoodItem(userID, food, res, callback, true);
    }

	});
};

var getUserFoodItemForApp = function(condition,population,callback){
    Food.find(condition,population).exec(function(err, results){
      if(err){
        callback(err);
      }else{
        // console.log(results);
        callback(null, results);
      }
    });
};

var getUserFoodItem = function(req, res) {

	var userRecords = {};
	var xml = req.body.UserFoodItem;
  console.log(req.body);
	//var xml2js = require('xml2js');
	var parseString = require('xml2js').parseString;
	// var builder =  new xml2js.Builder();
	// var js2xmlparser = require('js2xmlparser');


	var toLowerCase = function (name){
		return name.charAt(0).toLowerCase() + name.slice(1);
	};

	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		// console.log(result);
		var userID = result.userID;
		var date = new Date();
		date.setDate(date.getDate()-30000);

		getUserFoodItemForApp({
			'userID': userID//,
			// 'recordedTime':{
			// 	'$gte': date
			// }
		},{
			'_id':0,
			'userID':0,
			'__v':0,
		}, function(err, foodItems) {
			if(err) {
				return res.status(400).send(err);
			} else {
				// console.log(userRecords.reminder_Records);
				// res.jsonp((userRecords.a1cRecords));
        var resultValue = {
          userID: userID,
          foodItems: {
            foodItem: foodItems
          }
        };
				res.send(genXmlOutput('UserDefinedFood',resultValue, { 'pretty': false, 'indent': '', 'newline': '' }));
				// res.jsonp(builder.buildObject(userRecords.reminderRecords));
			}
		});
	});
};

exports.getUserFoodItem = getUserFoodItem;
