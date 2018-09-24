/**
 * Module dependencies.
 */
 require('../models/meal');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Meal = mongoose.model('Meal');
var ProfileCtrl = require('./profiles.server.controller');
var TopicCtrl = require('./topics.server.controller');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('./login.server.controller');


var login_cookie;

loginCtrl.getCookie(function(cookie){
	login_cookie = cookie;
});

 /**
 * Read knowledge base by ID
 */

 exports.getWeeklyAverageMealScore = function(userID, target_date, time_window, callback){
	 if(!target_date){
		 target_date = new Date();
	 }
	 if(!time_window){
		 time_window = 7;
	 }
	 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()+1);
	 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window+1);
	 Meal.aggregate([
		 {
			 '$match':{
				 'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
				 'recordedTime':{'$gte':start,'$lt':end},
				 'mealType': {'$in':['Breakfast', 'Lunch', 'Supper']}
			 }
		 },{
			 '$group':{
				 _id:{'$week':'$recordedTime'},
				 score:{'$avg':'$mealScore'}
			 }
		 }
	 ]).exec(function(err, meals){
		 if(err){
			 callback(err);
		 }else{
      //  console.log(meals);
			 if(meals.length === 0){
				 callback(null, 0);
			 }else if(meals[0].score){
				 callback(null, meals[0].score);
			 }else{
         callback(null, 0);
       }
		 }
	 });
};

exports.getWeeklyMealLogsCounts = function(userID, target_date, time_window, callback){
	if(!target_date){
		target_date = new Date();
	}
	if(!time_window){
		time_window = 7;
	}
	var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()+1);
	var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window+1);
  // console.log(end,start,userID);
	Meal.aggregate([
    {
      '$match':{
        'userID':userID, //*/mongoose.Types.ObjectId('556faaad83f3308daf02f898'),
        'recordedTime':{'$gte':start,'$lt':end},
        'mealType': {'$in':['Breakfast', 'Lunch', 'Supper']}
      }
    },{
      '$group':{
        _id:{'$dayOfYear':'$recordedTime'},
        count:{'$sum':1}
      }
    }
  ]).exec(function(err, meals){
		if(err){
			callback(err);
		}else{

			if(meals.length === 0){
				callback(null, 0);
			}else{
        var count = 0;
        meals.forEach(function(ele){

          if(ele.count > 3){
            count = count + 3;
          }else{
            count = count + ele.count;
          }
        });
				callback(null, count);
			}
		}
	});
};

exports.getDailyAverageMealScore = function(userID, target_date, time_window, callback){
  if(!target_date){
    target_date = new Date();
  }
  if(!time_window){
    time_window = 1;
  }
  var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()+1);
  var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window+1);
  Meal.aggregate([
    {
      '$match':{
        'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
        'recordedTime':{'$gte':start,'$lt':end},
        'mealType': {'$in':['Breakfast', 'Lunch', 'Supper']}
      }
    },{
      '$group':{
        _id:{'$week':'$recordedTime'},
        score:{'$avg':'$mealScore'}
      }
    }
  ]).exec(function(err, meals){
    if(err){
      callback(err);
    }else{
      console.log(meals);
      if(meals.length === 0){
        callback(null, 0);
      }else if(meals[0].score){
        callback(null, meals[0].score);
      }else{
        callback(null, 0);
      }
    }
  });
};

exports.getDailyMealLogsCounts = function(userID, target_date, time_window, callback){
 if(!target_date){
   target_date = new Date();
 }
 if(!time_window){
   time_window = 1;
 }
 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()+1);
 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window+1);
 console.log(end,start,userID);
 Meal.aggregate([
   {
     '$match':{
       'userID':userID, //*/mongoose.Types.ObjectId('556faaad83f3308daf02f898'),
       'recordedTime':{'$gte':start,'$lt':end},
       'mealType': {'$in':['Breakfast', 'Lunch', 'Supper']}
     }
   },{
     '$group':{
       _id:{'$dayOfYear':'$recordedTime'},
       count:{'$sum':1}
     }
   }
 ]).exec(function(err, meals){
   if(err){
     callback(err);
   }else{

     if(meals.length === 0){
       callback(null, 0);
     }else{
       var count = 0;
       meals.forEach(function(ele){

         if(ele.count > 2){
           count = count + 2;
         }else{
           count = count + ele.count;
         }
       });
       callback(null, count);
     }
   }
 });
};

exports.getDailyMealNutrition = function(userID, target_date, time_window, callback){
 if(!target_date){
   target_date = new Date();
 }
 if(!time_window){
   time_window = 1;
 }
 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()+1);
 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window+1);
 console.log(end,start,userID);
 Meal.aggregate([
   {
     '$match':{
       'userID':userID, //*/mongoose.Types.ObjectId('556faaad83f3308daf02f898'),
       'recordedTime':{'$gte':start,'$lt':end},
       'mealType': {'$in':['Breakfast', 'Lunch', 'Supper']}
     }
   },{
     '$group':{
       _id:{'$dayOfYear':'$recordedTime'},
       carb: {'$avg':'$carb'},
     	 fibre: {'$avg':'$fibre'},
     	 pro: {'$avg':'$pro'},
     	 fat: {'$avg':'$fat'},
     	 cals: {'$avg':'$cals'}
     }
   }
 ]).exec(function(err, meals){
   if(err){
     callback(err);
   }else{
     callback(null, meals[0]);
   }
 });
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
