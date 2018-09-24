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
		user:'55cacc98289cc1a162a61b04' //demo: 559d7f081f1f2c42758f5f02 john: 55cacc98289cc1a162a61b04
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

function caculateBurnCal(minutes, type) {

	var typeInfo = { 'Light':1.5, 'Moderate':4.5, 'Vigorous':8.5 };

	return typeInfo[type] * 100 * minutes/60;
}

var genXmlOutput =  require('../app/utils/genxmloutput.js'),
	request = require('request');

var sleep = {
	sleep_Record:[
		{
	minutes: 435 + Math.ceil(Math.random() * 100 / 0.1) / 10,
	recordedTime: new Date(2015, month, day, 06, 24, 0),
	uploadingVersion:0,
	sick:0,
	stressed:0
		}
	]
};


function genSleep(month, day) {
	var result = [];

	[0,1,2,3,4,5,6].forEach(function(offset) {
		var exerciseTime =  15 + Math.ceil(Math.random() * 19);

		result.push(

		{
			minutes: 435 + Math.ceil(Math.random() * 100 / 0.1) / 10,
				recordedTime: new Date(2015, month, day+offset, 06 + Math.ceil(Math.random() *3)
			,offset + Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			sick:0,
			stressed:0
		}
		)
	});

	return {
		sleep_Record: result};
}

exerciseTime =  15 + Math.ceil(Math.random() * 19);
var exercise = {
	exercise_Record:[
		{
			minutes: exerciseTime,
			type: 'Moderate',
			calories: caculateBurnCal(exerciseTime, 'Moderate'),
			interval: 0,
			recordedTime: new Date(2015, month, day, 6 + Math.ceil(Math.random() / 0.1)
				, 24, 0),
			uploadingVersion: 0
		}
	]
};

function genExercise(month, day) {
	var result = [];

	[0,1,2,3,4,5,6].forEach(function(offset) {
		var exerciseTime =  15 + Math.ceil(Math.random() * 19);

		result.push(
			{
				minutes: exerciseTime,
				type: 'Moderate',
				calories: caculateBurnCal(exerciseTime, 'Moderate'),
				interval: 0,
				recordedTime: new Date(2015, month, day+offset, 10 + Math.ceil(Math.random() *9)
					,offset + Math.ceil(Math.random()*30), 0),
				uploadingVersion: 0
			}
		)
	});

	return {
		exercise_Record: result};
}

function genStepCount(month, day) {
	var result = [];

	[0,1,2,3,4,5,6].forEach(function(offset) {
		var exerciseTime =  50 + Math.ceil(Math.random() * 23);

		result.push(
			{
				minutes: exerciseTime,
				stepCount:Math.ceil(exerciseTime*95),
				type: 'Light',
				exerciseRecordType:1,
				exerciseStartingTime:new Date(2015, month, day+offset, 10 + Math.ceil(Math.random() *9)
					,offset + Math.ceil(Math.random()*30), 0),
				calories: caculateBurnCal(exerciseTime, 'Light'),
				interval: 0,
				recordedTime: new Date(2015, month, day+offset, 10 + Math.ceil(Math.random() *9)
					,offset + Math.ceil(Math.random()*30), 0),
				uploadingVersion: 0
			}
		)
	});

	return {
		exercise_Record: result};
}

var weight ={
	weight_Record:[
		{
		weightValue: 73.5 + Math.ceil(Math.random() * 5 / 0.1) / 10,
		recordedTime: new Date(2015, month, day, 07, 24, 0),
	}
	]

};

//mongodump  --db rawdata --collection meals --query {userID:ObjectId("55e5fa1d603e573e1344e6db"), recordedTime:{$gt:new ISODate("2015-08-25T00:00:00Z")}}

var glucose = {
	glucose_Record: [
		{
			level:5 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 07, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:7 + Math.ceil(Math.random()*6/0.1)/10 ,
			recordedTime:new Date(2015, month, day, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:5 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:7 + Math.ceil(Math.random()*6/0.1)/10 ,
			recordedTime:new Date(2015, month, day, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:5 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:7 + Math.ceil(Math.random()*6/0.1)/10 ,
			recordedTime:new Date(2015, month, day, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:6 + Math.ceil(Math.random()*3/0.1)/10,
			recordedTime:new Date(2015, month, day, 20, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		}

	]};


var glucose2 = {
	glucose_Record: [
		{
			level:9,
			recordedTime:new Date(2015, month, day, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:8.8,
			recordedTime:new Date(2015, month, day+1, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:10,
			recordedTime:new Date(2015, month, day+2, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:8.5,
			recordedTime:new Date(2015, month, day+3, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:8.3,
			recordedTime:new Date(2015, month, day+4, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:8.3,
			recordedTime:new Date(2015, month, day+5, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},
		{
			level:7,
			recordedTime:new Date(2015, month, day+6, 07, Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:0
		},

		//after breakfast(10AM)	14	14	12	10.3	10.9	10.7	9.1
		{
			level:14 ,
			recordedTime:new Date(2015, month, day, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:14 ,
			recordedTime:new Date(2015, month, day+1, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:12 ,
			recordedTime:new Date(2015, month, day+2, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:10.3 ,
			recordedTime:new Date(2015, month, day+3, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:10.9 ,
			recordedTime:new Date(2015, month, day+4, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:10.7 ,
			recordedTime:new Date(2015, month, day+5, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
		{
			level:9.1 ,
			recordedTime:new Date(2015, month, day+6, 10, Math.ceil(Math.random()*21), 0),
			uploadingVersion:0,
			glucoseType:1
		},
//before lunch(12AM)	8.3	9	9	9.5	7.7	7.5	6.7
		{
			level:8.3,
			recordedTime:new Date(2015, month, day, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:9,
			recordedTime:new Date(2015, month, day+1, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:9,
			recordedTime:new Date(2015, month, day+2, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:9.5,
			recordedTime:new Date(2015, month, day+3, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:7.7,
			recordedTime:new Date(2015, month, day+4, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:7.5,
			recordedTime:new Date(2015, month, day+5, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
		{
			level:6.7,
			recordedTime:new Date(2015, month, day+6, 11, 30+Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:2
		},
//after lunch(02PM)	13.5	15	13	12.2	10	11.8	8.9
		{
			level:13.5,
			recordedTime:new Date(2015, month, day, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:15,
			recordedTime:new Date(2015, month, day+1, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:13,
			recordedTime:new Date(2015, month, day+2, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:12.2,
			recordedTime:new Date(2015, month, day+3, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:10,
			recordedTime:new Date(2015, month, day+4, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:11.8,
			recordedTime:new Date(2015, month, day+5, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		{
			level:8.9,
			recordedTime:new Date(2015, month, day+6, 14, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:3
		},
		//before dinner(06PM)	6.5	7	8.8	9.1	8.9	9.3	6.4
		{
			level:6.5,
			recordedTime:new Date(2015, month, day, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:7,
			recordedTime:new Date(2015, month, day+1, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:8.8,
			recordedTime:new Date(2015, month, day+2, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:9.1,
			recordedTime:new Date(2015, month, day+3, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:8.9,
			recordedTime:new Date(2015, month, day+4, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:9.3,
			recordedTime:new Date(2015, month, day+5, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		{
			level:6.4,
			recordedTime:new Date(2015, month, day+6, 16, Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:4
		},
		//after dinner(08PM)	14	15	12	12.7	11	12	9.5
		{
			level:14,
			recordedTime:new Date(2015, month, day, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:15,
			recordedTime:new Date(2015, month, day+1, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:12,
			recordedTime:new Date(2015, month, day+2, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:12.7,
			recordedTime:new Date(2015, month, day+3, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:11,
			recordedTime:new Date(2015, month, day+4, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:12,
			recordedTime:new Date(2015, month, day+5, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},
		{
			level:9.5,
			recordedTime:new Date(2015, month, day+6, 18,30+ Math.ceil(Math.random()*19), 0),
			uploadingVersion:0,
			glucoseType:5
		},

		//bedtime(09PM)	7.3	10	9.5	8.9	7.8	8.3	6.5

		{
			level:7.3,
			recordedTime:new Date(2015, month, day, 20, 40+Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		},
		{
			level:10,
			recordedTime:new Date(2015, month, day+1, 20, 40+ Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		},
		{
			level:9.5,
			recordedTime:new Date(2015, month, day+2, 20, 40+Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		},
		{
			level:8.9,
			recordedTime:new Date(2015, month, day+3, 20, 40+Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		},
		{
			level:7.8,
			recordedTime:new Date(2015, month, day+4, 20, 40+Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		},
		{
			level:8.3,
			recordedTime:new Date(2015, month, day+5, 20, 40+Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		},
		{
			level:6.5,
			recordedTime:new Date(2015, month, day+6, 20, 40+Math.ceil(Math.random()*30), 0),
			uploadingVersion:0,
			glucoseType:6
		}

	]};

var insulin = {
	insulin_Record:[
		{
			dose:6,
			insulinID:'in023',
			recordedTime:new Date(2015, month, day, 08, Math.ceil(Math.random()*30), 0),
		},
		{
			dose:8,
			insulinID:'in013',
			recordedTime:new Date(2015, month, day, 08, Math.ceil(Math.random()*30), 0),
		},
		{
			dose:3,
			insulinID:'in023',
			recordedTime:new Date(2015, month, day, 21, Math.ceil(Math.random()*30), 0),
		},
		{
			dose:3,
			insulinID:'in013',
			recordedTime:new Date(2015, month, day, 21, Math.ceil(Math.random()*30), 0),
		}
	]
};

function genInsulin(month, day) {
	var result = [];

	[0,1,2,3,4,5,6].forEach(function(offset) {
		/*result.push({
			dose:12,
			insulinID:'in011',
			recordedTime:new Date(2015, month, day+offset, 07, 30+offset+Math.ceil((Math.random())*11), 0),
		});

		result.push(
			{
				dose:8,
				insulinID:'in011',
				recordedTime:new Date(2015, month, day+offset, 19, offset+Math.ceil((Math.random()+1)*11), 0),
			}
		)*/


		//novorapid at breakfast 7 units, Lantus at breakfast 15,
		//lunch novorapid 7 units, supper novorapid 10units and bedtime Lantus 15 units.
		var records = [
			/*{
				dose:7,
				insulinID:'in023',
				recordedTime:new Date(2015, month, day+offset, 07, 20+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0)
			},*/
			{
				dose:15,
				insulinID:'in012',
				recordedTime:new Date(2015, month, day+offset, 07, 40+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0)
			},
			{
				dose:7,
				insulinID:'in023',
				recordedTime:new Date(2015, month, day+offset, 12, 15+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0)
			},
			{
				dose:10,
				insulinID:'in023',
				recordedTime:new Date(2015, month, day+offset, 18, 15+offset+Math.ceil(( Math.random())*Math.PI*Math.PI*2), 0)
			},
			{
				dose:15,
				insulinID:'in012',
				recordedTime:new Date(2015, month, day+offset, 20, 30+offset+Math.ceil(( Math.random())*Math.PI*Math.PI*2), 0)
			}
		];

		result.push.apply(result,records);


	});



	return {
		insulin_Record: result};
}

//<Medicine_Record>
//<Dose>850</Dose>
//<Unit>mg</Unit>
//<RecordedTime>2015-08-25T10:11:25-0400</RecordedTime>
//<MedicineID>med16</MedicineID>
//</Medicine_Record>

function genMedicine(month, day) {
	var result = [];

	[0,1,2,3,4,5,6].forEach(function(offset) {
		/*result.push({
		 dose:12,
		 insulinID:'in011',
		 recordedTime:new Date(2015, month, day+offset, 07, 30+offset+Math.ceil((Math.random())*11), 0),
		 });

		 result.push(
		 {
		 dose:8,
		 insulinID:'in011',
		 recordedTime:new Date(2015, month, day+offset, 19, offset+Math.ceil((Math.random()+1)*11), 0),
		 }
		 )*/


		//novorapid at breakfast 7 units, Lantus at breakfast 15,
		//lunch novorapid 7 units, supper novorapid 10units and bedtime Lantus 15 units.
		var records = [
			/*{
			 dose:7,
			 insulinID:'in023',
			 recordedTime:new Date(2015, month, day+offset, 07, 20+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0)
			 },*/
			{
				dose:850,
				unit:'mg',
				medicineID:'med16',
				recordedTime:new Date(2015, month, day+offset, 09, 40+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0)
			}
		];

		result.push.apply(result,records);


	});



	return {
		medicine_Record: result};
}

//db.useractivities.remove({user:ObjectId("55c5080e00dbf257afe98c4c"),activityName:"upload record",activityTime:{$gt: ISODate("2015-08-31T23:54:37.987Z")}})


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

var newMeal = {
	meal_Record:[
		{
			carb: 68.0,
			pro: 36.0,
			fat: 10.0,
			fibre:2.0,
			cals: 520.0,
			mealType:0, //breakfast
			mealEnterType:1,
			deviceMealID:generateUUID(),
			food_Records:{
				food_Record: [{
				foodItem: {
					foodItemID: 521791
				},
				foodItemServingSize: 2,
				servingSizeID: 507611,
				foodItemLogType: 0,
				foodItemPhoto:'meal_20150901_164618.jpg',
				carb: 68.0,
				pro: 36.0,
				fat: 10.0,
				fibre:2.0,
				cals: 520.0,
				}
				]
			},
			recordedTime:new Date(),
		}
	]
};

//{"cals":856.555298,"carb":137.084518,"deviceMealID":"A478652A-C63A-4BBA-98B2-5670D9FD9757",
// "fat":13.139476,
// "food":[{"_id":{"$oid":"55f1ed1607dbe947736cbeb5"},
// "itemID":521791,"servingSize":2,"servingSizeName":"1 Each"},{"_id":{"$oid":"55f1ed1607dbe947736cbeb6"},
// "itemID":517326,"servingSize":1,"servingSizeName":" .33 cup"},{"_id":{"$oid":"55f1ed1607dbe947736cbeb7"},
// "itemID":2490,"servingSize":1,"servingSizeName":"125ml"},{"_id":{"$oid":"55f1ed1607dbe947736cbeb8"},
// "itemID":504442,"servingSize":1,"servingSizeName":" 2 slices (48g)"}],
// "mealEnterType":"Search",
// "mealPhoto":"meal_20150901_164618.jpg","mealType":"Supper",
// "pro":47.204563,"recordedTime":{"$date":"2015-08-29T22:51:32.000Z"},"replyTimes":0,"userID":{"$oid":"55c5080e00dbf257afe98c4c"}}


function genMeal(month, day) {
	var result = [];

	[0,1,2,3,4,5,6].forEach(function(offset) {

		var records = [
			{
				carb: carb1,
				pro: pro1,
				fat: fat1,
				cals: Math.ceil((carb1*4 + pro1*4 + fat1*9)/0.1)/10,
				mealType:1, //breakfast
				mealEnterType:0,
				deviceMealID:generateUUID(),
				food_Records:null,
				recordedTime:new Date(2015, month, day+offset, 08, 10+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0),
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
				recordedTime:new Date(2015, month, day+offset, 12, 20+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0),
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
				recordedTime:new Date(2015, month, day+offset, 18, 30+offset+Math.ceil((Math.random())*Math.PI*Math.PI*2), 0),
			},
		]

		result.push.apply(result,records);


	});



	return {
		meal_Record: result};
}


//db.insulintypes.update({insulinID:"in023"}, {$set: { name:"NovoRapid"}})
//db.insulins.remove({userID:ObjectId("55c5080e00dbf257afe98c4c")})

var req = {
	userID: user,
	//glucoses_Records: glucose2,
	//insulin_Records: genInsulin(month, day),
	//medicine_Records: genMedicine(month, day),
	//weight_Records: weight,
	//sleep_Records:genSleep(month, day),
	//exercise_Records:genExercise(month, day),
	exercise_Records:genStepCount(month, day),
	//meal_Records:genMeal(month, day),
	//meal_Records:newMeal,
	created_Time: new Date()
};

var xml = genXmlOutput('user_Record', req);
//res.end(xml);
console.log(xml);

//curl -k -X POST -d, --data-urlencode userRecord@test.xml https://test.glucoguide.com/GlucoGuide/Write
//curl -k -X POST -d, --data-urlencode userRecord@test.xml https://test.glucoguide.com/GlucoGuide/Write

/**/
request.post(svrURL, {form:{userRecord:xml}},
	function (error, response, body) {
		if(error) {
			console.log('failed to add records');
			console.log(JSON.stringify(error));
			console.log(JSON.stringify(response));
		} else {
			console.log(JSON.stringify(body));
		}
	});


