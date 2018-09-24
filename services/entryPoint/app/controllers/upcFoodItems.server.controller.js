/**
 * Created by Canon on 2015-12-30.
 */
'use strict';
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	//FoodItem = mongoose.model('FSFoodItem'),
	FoodItem = mongoose.model('NXFoodItem'),
	genXmlOutput =  require('../utils/genxmloutput.js'),
	FatSecret = require('../utils/FatSecretService.js'),
	NutritioniX = require('../utils/NutritioniXService.js');

var genXmlOutputPlain = function(rootTag, jsonObj) {
	return genXmlOutput(rootTag, jsonObj, { 'pretty': false, 'indent': '', 'newline': '' });
};

var jsonErrors = {
	BarCodeFormatError: {
		UPCScaning_Status:1, error: {message: 'BarCode Format Error'}
	},
	BarCodeNotFoundError: {
		UPCScaning_Status:2, error: {message: 'BarCode Not Found Error'}
	},
	InternalDatabaseError: {
		UPCScaning_Status:3, error: {message: 'Could Not Read or Write in Database'}
	}

};

var xmlErrors = {
	BarCodeFormatError: genXmlOutputPlain('UPC_Scan', jsonErrors.BarCodeFormatError),
	BarCodeNotFoundError: genXmlOutputPlain('UPC_Scan', jsonErrors.BarCodeNotFoundError),
	InternalDatabaseError: genXmlOutputPlain('UPC_Scan', jsonErrors.InternalDatabaseError),

};

var getErrors = function(method) {
	if(method === 'json') {
		return jsonErrors;
	}
	return xmlErrors;
};

//TODO convert UPC-E to UPC-A
//Cannot be used now
//program converting upc-e to upc-a
//String => String
var convert_UPCE_to_UPCA = function(upce_value) {
	var calc_check_digit = function(value) {
		var check_digit = 0;
		var odd_pos = true;
		var valueReverse = value.split('').reverse();
		var ch = '';
		valueReverse.forEach(function(ch){
			if(odd_pos) {
				check_digit+=Number(ch)*3;
			} else {
				check_digit+=Number(ch);
			}
			odd_pos=!odd_pos;
		});

		check_digit = check_digit % 10;
		check_digit = 10-check_digit;
		check_digit = check_digit % 10;
		return check_digit;
	};
	var middle_digits = upce_value.slice(1, 7);
	var d1 = middle_digits[0];
	var d2 = middle_digits[1];
	var d3 = middle_digits[2];
	var d4 = middle_digits[3];
	var d5 = middle_digits[4];
	var d6 = middle_digits[5];
	var mfrnum = '';
	var itemnum = '';
	if(d6 === '0' || d6 === '1' || d6 === '2'){
		mfrnum=d1+d2+d6+'00';
		itemnum='00'+d3+d4+d5;
	} else if(d6 === '3') {
		mfrnum=d1+d2+d3+'00';
		itemnum='000'+d4+d5;
	} else if(d6==='4') {
		mfrnum=d1+d2+d3+d4+'0';
		itemnum='0000'+d5;
	} else{
		mfrnum=d1+d2+d3+d4+d5;
		itemnum='0000'+d6;
	}
	var newmsg='0'+mfrnum+itemnum;
	var check_digit=calc_check_digit(newmsg);
	return newmsg+String(check_digit);
};

/**
 * upcFoodItem middleware
 */
exports.checkbarcode = function(req, res, next) {
	var barCode = req.param('upc');
	if(!barCode) {
		return res.send(getErrors(req.resmethod).BarCodeFormatError);
	}
	if(barCode.length !== 13 && barCode.length !== 12 && barCode.length !== 8) {
		//upc-a should has length of 12 and ean-13 should has length of 13
		//upc-e should has length of 8
		console.log('Invalid Barcode Format');
		//TODO how to handle error
		return res.send(getErrors(req.resmethod).BarCodeFormatError);
	}
	next();
};

exports.upcFoodItemByUPC = function(req, res, next) {
	var barCode = req.param('upc');
	//if the barcode is 12 digits, which is a UPC-A code
	//then it should be transfer to EAN-13 by adding 0 on the left
	//for USA and Canada food
	//if it is a 8-digits code, then it should be a UPC-E and should be transfer to UPC-A and EAN-13
	if(String(barCode).length === 12) {
		barCode = '0' + barCode;
	} else if(String(barCode).length === 8) {
		barCode = '0' + convert_UPCE_to_UPCA(barCode);
	}
	var upcFoodItemByUPCFromRemote = function(barCode, callback) {
		FatSecret.getFoodItemByBarCode(barCode, function(error, data) {
			if(error) {
				//call NutritionX
				NutritioniX.getFoodItemIdByBarCode(barCode, callback);
			}else {
				callback(null,data);
			}
		});
	};


	var returnFoodItem = function(data) {
		req.fooditem = data;
	};



	FoodItem.findOne({'upc':barCode}, function(err, data) {
		if(err) {
			console.log('Error when querying in DB: ', err.message);
			//next(err);
		}
		if(Number(barCode) === 0) {
			return res.send(getErrors(req.resmethod).BarCodeNotFoundError);
		}
		//there is no record in the gg database, try to get new one
		if(!data) {
			upcFoodItemByUPCFromRemote(barCode, function(err, data) {
				if(err) {
					console.log('Error in upcFoodItemByUPCFromRemote', err.message);
					return res.send(getErrors(req.resmethod).BarCodeNotFoundError);
				}

				var newFoodItem = new FoodItem(data);

				newFoodItem.save(function(err) {
					if(err) {
						console.log('Error when saving the fooditem', err.message);
						res.status(400).send(getErrors(req.resmethod).InternalDatabaseError);
					} else {
						returnFoodItem(newFoodItem);
						next();
					}
				});
			});
			//there is record in gg database, but the client request to update it
		} else if(req.forceupdate) {
			var oldItem = data;
			upcFoodItemByUPCFromRemote(barCode, function(err, data) {
				if(err) {
					console.log('Error in upcFoodItemByUPCFromRemote: ',err.message);
					return res.send(getErrors(req.resmethod).BarCodeNotFoundError);
				}
				// console.log('Read from remote server for updating');
				var foodItem = data;
				oldItem.servings = foodItem.servings;
				oldItem.save(function(err) {
					if(err) {
						console.log('Error when updating the fooditem', err.message);
						res.status(400).send(getErrors(req.resmethod).InternalDatabaseError);
					} else {
						returnFoodItem(oldItem);
						next();
					}
				});
			});
			// there is record in gg database, return that record.
		} else {
			// console.log('Read from gg server');
			returnFoodItem(data);
			next();
		}
	});
};

exports.setResponseMethod = function(req, res, next) {
	var method = req.param('method');
	if(!method) {
		method = req.param('method');
	}
	if(method === 'json') {
		req.resmethod = 'json';
	} else {
		req.resmethod = 'xml';
	}
	next();
};

exports.setUpdateStrategy = function(req, res, next) {
	var forceupdate = req.param('forceupdate');
	if(!forceupdate) {
		forceupdate = false;
	} else if(forceupdate.toLowerCase() === 'true') {
		forceupdate = true;
	} else {
		forceupdate = false;
	}
	req.forceupdate = forceupdate;
	next();
};


/**
 * Show the current upcFoodItem
 */
exports.read = function(req, res) {

	var result = {};
	result.UPCScaning_Status = 0;
	result.labels = {};
	result.labels.label = {};
	result.labels.label = FatSecret.fooditem2response(req.fooditem);


	if(req.resmethod === 'json') {
		res.json(result);
	} else {
		var xml = genXmlOutputPlain('UPC_Scan', result);
		res.end(xml);
	}
};
