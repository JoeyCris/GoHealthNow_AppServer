/**
 * Created by Canon on 2016-02-12.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rawdata');

require('../../app/models/record.log_view');
var Meal = mongoose.model('Meal');
var ObjectId = mongoose.Schema.Types.ObjectId;

var bmi = 23.28306;
var weight = 100;
var height = 176;
var user = {};
user.weight = 100;
user.height = 176;
user.gender = 0;
user.dob = 1975;
var calculator = require('./../calculateScore/calculateMealScore');
var getIdeaCals = function(user) {
	var bmr = 0.0;
	var age = new Date().getFullYear() -  user.dob;
	if (user.gender === 0) { //male
		bmr = 88.362 + 13.397 * (user.weight) + 4.799 * user.height - 5.677 * age;
	} else {
		bmr = 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.330 * age;
	}
	var idealCals = 1.2 * bmr;
	return idealCals;
};


var fakeMealSample = [
	{ 'carb' : 67.6, 'pro' : 11.8, 'fat' : 2.6, 'cals' : 327.1, 'fibre' : 6.3, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '69a63caa-f20b-476c-aa36-9ec602c5c814', 'replyTimes' : 0, 'recordedTime' : new Date() },
	{ 'carb' : 68, 'pro' : 38, 'fat' : 29.5, 'cals' : 686, 'fibre' : 8.5, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '822db45d-2228-488f-89dd-711355be7758', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-01T04:51:54Z') },
	{ 'carb' : 91.1, 'pro' : 33.4, 'fat' : 62.1, 'cals' : 1057.7, 'fibre' : 9.7, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : 'c0e216b2-e7d1-42c2-808d-33708393b0f5', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-02T00:12:45Z') },
	{ 'carb' : 67.5, 'pro' : 11.5, 'fat' : 16.3, 'cals' : 445.4, 'fibre' : 6.6, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : 'be7f36ed-3abd-48ab-8c93-3d62a03f6820', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-02T00:04:55Z') },
	{ 'carb' : 36.4, 'pro' : 11.8, 'fat' : 3.9, 'cals' : 229.3, 'fibre' : 1.9, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : 'e56e5dab-136e-43e8-a684-4a51ed277516', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-02T00:07:02Z') },
	{ 'carb' : 67.5, 'pro' : 11.8, 'fat' : 19.3, 'cals' : 471.9, 'fibre' : 6.6, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '7803e6f6-ef62-45bb-ae71-ec7787ebdca3', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-03T18:03:57Z') },
	{ 'carb' : 61.1, 'pro' : 18, 'fat' : 27.6, 'cals' : 566.6, 'fibre' : 8, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '3a107224-5e63-4fa8-bee7-f9f88075c93d', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-03T18:09:15Z') },
	{ 'carb' : 56.9, 'pro' : 29.3, 'fat' : 32.3, 'cals' : 643.1, 'fibre' : 7.1, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '9cc396ff-69cb-48bb-a797-c8f4d26bb03d', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-04T22:40:16Z') },
	{ 'carb' : 68.3, 'pro' : 31.4, 'fat' : 30, 'cals' : 663.4, 'fibre' : 2.9, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '684d22df-9ce6-4abc-8e6b-c07c84f18a1b', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-04T01:19:10Z') },
	{ 'carb' : 76.5, 'pro' : 11.8, 'fat' : 14.8, 'cals' : 475.4, 'fibre' : 6.6, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '87c6cedf-250a-44a0-bf31-21f009f5a069', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-05T16:09:57Z') },
	{ 'carb' : 67.5, 'pro' : 11.8, 'fat' : 19.3, 'cals' : 471.9, 'fibre' : 0, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : 'dedf1446-9603-45c2-a0ee-a26cdc701f10', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-06T18:05:01Z') },
	{ 'carb' : 69.4, 'pro' : 15.9, 'fat' : 0.6, 'cals' : 347.9, 'fibre' : 2.8, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '325023ff-d1cd-44aa-8d0e-02e50a15a6bd', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-07T16:41:36Z') },
	{ 'carb' : 63.5, 'pro' : 16.9, 'fat' : 2, 'cals' : 344.3, 'fibre' : 7.1, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '036f24d9-3f35-41d4-bad5-595136aa1d92', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-07T18:02:49Z') },
	{ 'carb' : 59.8, 'pro' : 53.9, 'fat' : 23.1, 'cals' : 653.8, 'fibre' : 6, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '83854252-2f1b-4302-b7bf-13abbf4bb3d6', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-08T00:23:09Z') },
	{ 'carb' : 46, 'pro' : 23, 'fat' : 4, 'cals' : 312, 'fibre' : 5, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '3192d5bc-9419-4207-ad97-37eddd41e83c', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-09T21:15:57Z') },
	{ 'carb' : 18, 'pro' : 1.3, 'fat' : 0.2, 'cals' : 79, 'fibre' : 3, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : '020650e4-17c4-46c6-b1ab-3f9730e8b0d6', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-10T21:15:29Z') },
	{ 'carb' : 21, 'pro' : 0.4, 'fat' : 0.2, 'cals' : 88, 'fibre' : 4, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : '38f435d6-b651-468f-87cc-7e800bde10cc', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-11T21:14:54Z') },
	{ 'carb' : 46, 'pro' : 23, 'fat' : 4, 'cals' : 312, 'fibre' : 5, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '113ddb9a-fff3-4b74-9d51-bf9620e92686', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-12T21:25:22Z') },
	{ 'carb' : 21, 'pro' : 0.4, 'fat' : 0.2, 'cals' : 88, 'fibre' : 4, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : '72061188-3289-4009-abb5-c98ac504450e', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-13T21:31:47Z') },
	{ 'carb' : 9, 'pro' : 15, 'fat' : 5, 'cals' : 141, 'fibre' : 1, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '07c1976d-9ad0-4c35-9526-cb16516131d7', 'replyTimes' : 0, 'recordedTime' : new Date('2015-08-14T21:32:55Z') },
	{ 'carb' : 18, 'pro' : 1.3, 'fat' : 0.2, 'cals' : 79, 'fibre' : 3, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : 'b0135dc3-b02b-4b39-a4a4-4c3d82f51763', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:32:08Z') },
	{ 'carb' : 46, 'pro' : 23, 'fat' : 4, 'cals' : 312, 'fibre' : 5, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : 'd394f701-fdd6-4a6a-9fa2-181ee353c71f', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:32:28Z') },
	{ 'carb' : 59, 'pro' : 40.2, 'fat' : 12.1, 'cals' : 502.2, 'fibre' : 7.1, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : 'fabb8dbb-fe57-4ea2-b730-d07e82159e47', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:44:37Z') },
	{ 'carb' : 51.4, 'pro' : 7.3, 'fat' : 2.2, 'cals' : 247.6, 'fibre' : 5.7, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : '9352fc0d-c433-4391-a9aa-e6fdff3f6a86', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T22:02:53Z') },
	{ 'carb' : 71.4, 'pro' : 38.3, 'fat' : 9.2, 'cals' : 514.6, 'fibre' : 7.7, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '91087294-7a6f-4da2-b616-ce11648238ff', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T22:11:46Z') },
	{ 'carb' : 54, 'pro' : 3.9, 'fat' : 0.6, 'cals' : 237, 'fibre' : 9, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : '5e7b3466-4f78-4195-85de-c9e05fd55896', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T23:12:04Z') },
	{ 'carb' : 48.6, 'pro' : 13.2, 'fat' : 0.5, 'cals' : 254.3, 'fibre' : 4.2, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '3f44b806-a7f3-4b71-9bfe-85cdd39dd87a', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-06T16:46:26Z') },
	{ 'carb' : 52.2, 'pro' : 34.3, 'fat' : 29.1, 'cals' : 770.5, 'fibre' : 5.5, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '216f2064-6871-46d3-a111-d1111a3b26cb', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:51:18Z') },
	{ 'carb' : 52.8, 'pro' : 26.9, 'fat' : 45, 'cals' : 707.8, 'fibre' : 6.1, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : 'f8f4a6ba-fe1d-4976-bc57-b1f59166c7c6', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:39:21Z') },
	{ 'carb' : 76.5, 'pro' : 11.8, 'fat' : 14.8, 'cals' : 475.4, 'fibre' : 6.6, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '9849e757-9d06-4aa9-842a-b3408c34c6e0', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:34:34Z') },
	{ 'carb' : 67.6, 'pro' : 1, 'fat' : 11.2, 'cals' : 377.3, 'fibre' : 0, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : 'd39f5b98-c0c1-4ecf-aaf0-419d4567c6c2', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-05T21:54:28Z') },
	{ 'carb' : 61, 'pro' : 22, 'fat' : 25, 'cals' : 672.4, 'fibre' : 7.9, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : '23604764-43b9-4e54-ab06-fe64e5626559', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-07T01:15:35Z') },
	{ 'carb' : 76.5, 'pro' : 11.8, 'fat' : 17.8, 'cals' : 501.9, 'fibre' : 6.6, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : 'd520da9d-41bf-4e22-9d96-12d1fd26b6c2', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-07T14:45:28Z') },
	{ 'carb' : 49.9, 'pro' : 17.3, 'fat' : 24.5, 'cals' : 483.5, 'fibre' : 7.6, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '6f79a1a2-0510-44f0-80be-239c34501ab2', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-07T22:21:21Z') },
	{ 'carb' : 33, 'pro' : 13, 'fat' : 4, 'cals' : 209, 'fibre' : 4, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : 'aa6a2952-96ac-451f-b124-25247806ec4c', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-08T19:53:32Z') },
	{ 'carb' : 47.1, 'pro' : 25, 'fat' : 46, 'cals' : 742.8, 'fibre' : 4, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : 'c82da529-ab6a-4c56-9f06-556b49158abe', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-08T00:14:24Z') },
	{ 'carb' : 49.9, 'pro' : 17.3, 'fat' : 24.5, 'cals' : 483.5, 'fibre' : 7.6, 'mealEnterType' : 'Search', 'mealType' : 'Lunch', 'deviceMealID' : '0d50c5ce-8d8b-4182-9bc1-601ee0588155', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-09T00:22:41Z') },
	{ 'carb' : 9.8, 'pro' : 0.7, 'fat' : 3.1, 'cals' : 68.1, 'fibre' : 0.4, 'mealEnterType' : 'Search', 'mealType' : 'Snack', 'deviceMealID' : '1926002e-e51c-43f8-9ba6-3b04240a8b97', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-09T00:28:32Z') },
	{ 'carb' : 76.5, 'pro' : 11.8, 'fat' : 14.8, 'cals' : 475.4, 'fibre' : 6.6, 'mealEnterType' : 'Search', 'mealType' : 'Breakfast', 'deviceMealID' : '49fa69eb-81b9-47f2-8016-a1bbfff29b83', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-09T00:19:07Z') },
	{ 'carb' : 57.4, 'pro' : 39.1, 'fat' : 12.3, 'cals' : 512.9, 'fibre' : 7.1, 'mealEnterType' : 'Search', 'mealType' : 'Supper', 'deviceMealID' : 'b0cf5695-7367-48e3-b4cf-c88ffc0ef207', 'replyTimes' : 0, 'recordedTime' : new Date('2015-12-09T00:27:45Z') }
];

var userID = '558466f4673f54f02f8da687';
//56b253c36d53d4ff26849ee0
//56b531aec9da9e4d30eb4030
//56e9b1898fe3386741bd69bb
//563aafb3523f66a3ae6483c2


var startDate = new Date('2015-08-01');
var endDate = new Date('2015-12-31');
var len = fakeMealSample.length;
var ideaCals = getIdeaCals(user);

var sortByMealScore = function () {
	fakeMealSample.forEach(function (meal) {
		meal.mealScore = calculator.getScore(ideaCals, meal);
		// console.log(meal.mealScore);
	});
	fakeMealSample.sort(function (a, b) {
		return a.mealScore - b.mealScore;
	});
	fakeMealSample.forEach(function (meal) {
		// meal.mealScore = calculator.getScore(ideaCals, meal);
		console.log(meal.mealScore);
	});
};

var curDate = new Date(startDate);

var addMealData = function() {
	if (curDate <= endDate) {
		var totalLen = fakeMealSample.length;
		// console.log(endDate - startDate);
		var curRange = (curDate - startDate) / (endDate - startDate);
		var range = 0.2;
		// var indexRange = (Math.random() * range + curRange) / (1 + range);
		var indexRange = Math.random();
		var index = Math.floor((indexRange * len) % len);
		if (index < 0) index = 0;
		console.log('index: ' + index);
		// var carStart = Math.floor(Math.random() * len);
		// console.log(curRange);
		var currentMeal = fakeMealSample[index];
		currentMeal = JSON.parse(JSON.stringify(currentMeal));
		currentMeal.recordedTime = new Date(curDate.toISOString());
		currentMeal.mealScore = calculator.getScore(ideaCals, currentMeal);
		currentMeal.userID = userID;

		currentMeal = JSON.parse(JSON.stringify(currentMeal));
		Meal.create(currentMeal, function(err){
			if(err) {
				console.log(err);
			}
			// console.log(currentMeal);
			curDate.setDate(curDate.getDate()+1);
			addMealData();
		});
	} else {
		console.log('All record added!');
		process.exit(0);
	}
};




var addMealByIncreasingScores = function () {
	sortByMealScore();
	addMealData();
};

calculator.init(addMealByIncreasingScores);
