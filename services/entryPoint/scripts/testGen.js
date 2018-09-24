/**
 * Created by nodejs on 25/08/15.
 */


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
var day = process.argv[4];


var config = {
	api:{
		svrURL:'http://localhost:3000/GlucoGuide/Write',
		//svrURL:'https://api.glucoguide.com/GlucoGuide/Write',
		user:'55c5080e00dbf257afe98c4c'
	},
	local:{
		svrURL:'http://localhost:3000/GlucoGuide/Write',
		user:'55c5080e00dbf257afe98c4c'
	},
	test:{
		svrURL:'https://test.glucoguide.com/GlucoGuide/Write',
		user:'55cacc98289cc1a162a61b04'
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


var genXmlOutput =  require('../app/utils/genxmloutput.js'),
	request = require('request');

var sleep = {
	sleep_Record:[
		{
	minutes: 435 + Math.ceil(Math.random() * 100),
	recordedTime: new Date(2015, month, day, 06, 24, 0),
	uploadingVersion:0,
	sick:0,
	stressed:0
		}
	]
};

var exercise = {
	exercise_Record:[
		{
			minutes: 25 + Math.ceil(Math.random() * 20 / 0.1) / 10,
			type: 'Moderate',
			interval: 0,
			recordedTime: new Date(2015, month, day, 6 + Math.ceil(Math.random() / 0.1)
				, 24, 0),
			uploadingVersion: 0
		}
	]
};

var weight ={
	weight_Record:[
		{
		weightValue: 73.5 + Math.ceil(Math.random() * 5 / 0.1) / 10,
		recordedTime: new Date(2015, month, day, 07, 24, 0),
	}
	]

};

var glucose = {
	glucose_Record: [
		{
			level:5 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 07, 24, 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:7 + Math.ceil(Math.random()*6/0.1)/10 ,
			recordedTime:new Date(2015, month, day, 09, 24, 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:5 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 11, 24, 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:7 + Math.ceil(Math.random()*6/0.1)/10 ,
			recordedTime:new Date(2015, month, day, 14, 24, 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:5 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 15, 24, 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:7 + Math.ceil(Math.random()*6/0.1)/10 ,
			recordedTime:new Date(2015, month, day, 18, 24, 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:6 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 20, 24, 0),
			uploadingVersion:0,
			glucoseType:6
		}

	]};



var insulin = {
	insulin_Record:[
		{
			dose:4,
			insulinID:'in023',
			recordedTime:new Date(2015, month, day, 08, 0, 0),
		},
		{
			dose:6,
			insulinID:'in013',
			recordedTime:new Date(2015, month, day, 08, 10, 0),
		},
		{
			dose:2,
			insulinID:'in023',
			recordedTime:new Date(2015, month, day, 21, 0, 0),
		},
		{
			dose:2,
			insulinID:'in013',
			recordedTime:new Date(2015, month, day, 21, 10, 0),
		}
	]
};



var carb1 = 51 + Math.ceil(Math.random()*10/0.1)/10,
	pro1 = 28 + Math.ceil(Math.random()*10/0.1)/10,
	fat1 = 22 + Math.ceil(Math.random()*10/0.1)/10;

var carb2 = 91 + Math.ceil(Math.random()*10/0.1)/10,
	pro2 = 21 + Math.ceil(Math.random()*10/0.1)/10,
	fat2 = 16 + Math.ceil(Math.random()*10/0.1)/10;

var carb3 = 75.8 + Math.ceil(Math.random()*10/0.1)/10,
	pro3 = 30.2 + Math.ceil(Math.random()*10/0.1)/10,
	fat3 = 24.5 + Math.ceil(Math.random()*10/0.1)/10;
/*
var food_Record = {
		FoodItem：
	<FoodItem>
	<FoodItemID>512866</FoodItemID>
	</FoodItem>
	<FoodItemServingSize>1.250000</FoodItemServingSize>
	<ServingSizeID>505093</ServingSizeID>
}*/
function generateUUID(){
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}

var meal = {
	meal_Record:[
		{
			carb: carb1,
			pro: pro1,
			fat: fat1,
			cals: Math.ceil((carb1*4 + pro1*4 + fat1*9)/0.1)/10,
			mealType:1, //breakfast
			mealEnterType:0,
			deviceMealID:generateUUID(),
			food_Records:null,
			recordedTime:new Date(2015, month, day, 08, 10, 0),
		},
		{
			carb: carb2,
			pro: pro2,
			fat: fat2,
			cals:Math.ceil(( carb2*4 + pro2*4 + fat2*9)/0.1)/10,
			mealType:2, //lunch
			mealEnterType:0,
			deviceMealID:generateUUID(),
			food_Records:null,
			recordedTime:new Date(2015, month, day, 12, 10, 0),
		},
		{
			carb: carb3,
			pro: pro3,
			fat: fat3,
			cals: Math.ceil((carb3*4 + pro3*4 + fat3*9)/0.1)/10,
			mealType:3, //dinner
			mealEnterType:0,
			deviceMealID:generateUUID(),
			food_Records:null,
			recordedTime:new Date(2015, month, day, 18, 10, 0),
		},
	]
};


var req = {
	userID: user,
	//glucoses_Records: glucose,
	//insulin_Records: insulin,
	//weight_Records: weight,
	sleep_Records:sleep,
	//exercise_Records:exercise,
	//meal_Records:meal,
	created_Time: new Date()
};

var xml = genXmlOutput('user_Record', req);
//res.end(xml);
console.log(xml);

request.post(svrURL, {form:{userRecord:xml}},
	function (error, response, body) {
		if(error) {
			console.log('failed to add records');
			console.log(JSON.stringify(error));
		} else {
			console.log(JSON.stringify(body));
		}
	});



