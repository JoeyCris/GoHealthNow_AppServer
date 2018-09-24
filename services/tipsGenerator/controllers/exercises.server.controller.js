/**
 * Module dependencies.
 */
 require('../models/exercise');
 require('../models/user.activities.server.model');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Exercise = mongoose.model('Exercise'),
    UserActivities = mongoose.model('UserActivities');
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

 //Extra function for getting Weekly Usage.

 exports.getWeeklyUsage = function(userID, target_date, time_window, callback){
     if(!target_date){
         target_date = new Date();
     }
     if(!time_window){
         time_window = 7;
     }
     var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
     var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);

     UserActivities.aggregate([
         {'$match': {
                    'activityTime': {'$gte': start, '$lt': end},
                    'user':userID
                  }
         },

         {'$group': {

             '_id': {'$dayOfYear': '$activityTime'},
             'Activity': {'$sum': 1}
           }
         }
     ]).exec(function(err, Activity){
         if(err){
             callback(err);
         }else{

             if(Activity.length === 0){
                 callback(null, 0);
             }else{
                 var total = 0;
                 var count = 0;
                 Activity.forEach(function(ele){
                     total = total + ele.Activity;
                     count = count + 1;
                 });
                 callback(null, total*1.0/time_window);
             }
         }
     });
 };



 exports.getWeeklyAverageStepCount = function(userID, target_date, time_window, callback){
	 if(!target_date){
		 target_date = new Date();
	 }
	 if(!time_window){
		 time_window = 7;
	 }
	 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
	 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
	 Exercise.aggregate([
		 {
			 '$match':{
				 'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
        //  'type': {'$in':['Moderate', 'Vigorous']},
				 'recordedTime':{'$gte':start,'$lt':end}
			 }
		 },{
			 '$group':{
				 '_id':{'$dayOfYear':'$recordedTime'},
				 'stepCount':{'$sum':'$stepCount'}
			 }
		 }
	 ]).exec(function(err, stepCounts){
		 if(err){
			 callback(err);
		 }else{
			 if(stepCounts.length === 0){
				 callback(null, 0);
			 }else{
         var total = 0;
         var count = 0;
         stepCounts.forEach(function(ele){
           total = total + ele.stepCount;
           count = count + 1;
         });
         callback(null, total*1.0/time_window);
       }
		 }
	 });
};

exports.getWeeklyAveragePedometerCalory = function(userID, target_date, time_window, callback){
  if(!target_date){
    target_date = new Date();
  }
  if(!time_window){
    time_window = 7;
  }
  var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
  var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
  Exercise.aggregate([
    {
      '$match':{
        'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
       //  'type': {'$in':['Moderate', 'Vigorous']},
        'exerciseRecordType': 1,
        'recordedTime':{'$gte':start,'$lt':end}
      }
    },{
      '$group':{
        '_id':{'$dayOfYear':'$recordedTime'},
        'calories':{'$sum':'$calories'}
      }
    }
  ]).exec(function(err, calories){
    if(err){
      callback(err);
    }else{
      if(calories.length === 0){
        callback(null, 0);
      }else{
        var total = 0;
        var count = 0;
        calories.forEach(function(ele){
          total = total + ele.calories;
          count = count + 1;
        });
        callback(null, total*1.0/time_window);
      }
    }
  });
};

exports.getWeeklyAverageManualInputCalory = function(userID, target_date, time_window, callback){
  if(!target_date){
    target_date = new Date();
  }
  if(!time_window){
    time_window = 7;
  }
  var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
  var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
  Exercise.aggregate([
    {
      '$match':{
        'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
       //  'type': {'$in':['Moderate', 'Vigorous']},
        '$or': [ { 'exerciseRecordType': 0 }, { 'exerciseRecordType': {'$exists': false} }] ,
        'recordedTime':{'$gte':start,'$lt':end}
      }
    },{
      '$group':{
        '_id':{'$dayOfYear':'$recordedTime'},
        'calories':{'$sum':'$calories'}
      }
    }
  ]).exec(function(err, calories){
    if(err){
      callback(err);
    }else{
      if(calories.length === 0){
        callback(null, 0);
      }else{
        var total = 0;
        var count = 0;
        calories.forEach(function(ele){
          total = total + ele.calories;
          count = count + 1;
        });
        callback(null, total*1.0/time_window);
      }
    }
  });
};

/**
* Read knowledge base by ID
*/

exports.getDailyAverageStepCount = function(userID, target_date, time_window, callback){
  if(!target_date){
    target_date = new Date();
  }
  if(!time_window){
    time_window = 1;
  }
  var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
  var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
  Exercise.aggregate([
    {
      '$match':{
        'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
       //  'type': {'$in':['Moderate', 'Vigorous']},
        'recordedTime':{'$gte':start,'$lt':end}
      }
    },{
      '$group':{
        '_id':{'$dayOfYear':'$recordedTime'},
        'stepCount':{'$sum':'$stepCount'}
      }
    }
  ]).exec(function(err, stepCounts){
    if(err){
      callback(err);
    }else{
      if(stepCounts.length === 0){
        callback(null, 0);
      }else{
        var total = 0;
        var count = 0;
        stepCounts.forEach(function(ele){
          total = total + ele.stepCount;
          count = count + 1;
        });
        callback(null, total*1.0/time_window);
      }
    }
  });
};

exports.getDailyAveragePedometerCalory = function(userID, target_date, time_window, callback){
 if(!target_date){
   target_date = new Date();
 }
 if(!time_window){
   time_window = 1;
 }
 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
 Exercise.aggregate([
   {
     '$match':{
       'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
      //  'type': {'$in':['Moderate', 'Vigorous']},
       'exerciseRecordType': 1,
       'recordedTime':{'$gte':start,'$lt':end}
     }
   },{
     '$group':{
       '_id':{'$dayOfYear':'$recordedTime'},
       'calories':{'$sum':'$calories'}
     }
   }
 ]).exec(function(err, calories){
   if(err){
     callback(err);
   }else{
     if(calories.length === 0){
       callback(null, 0);
     }else{
       var total = 0;
       var count = 0;
       calories.forEach(function(ele){
         total = total + ele.calories;
         count = count + 1;
       });
       callback(null, total*1.0/time_window);
     }
   }
 });
};

exports.getDailyAverageManualInputCalory = function(userID, target_date, time_window, callback){
 if(!target_date){
   target_date = new Date();
 }
 if(!time_window){
   time_window = 1;
 }
 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
 Exercise.aggregate([
   {
     '$match':{
       'userID':userID, //ObjectId('559d6512179d37bd8ceac753')
      //  'type': {'$in':['Moderate', 'Vigorous']},
       'exerciseRecordType': 0,
       'recordedTime':{'$gte':start,'$lt':end}
     }
   },{
     '$group':{
       '_id':{'$dayOfYear':'$recordedTime'},
       'calories':{'$sum':'$calories'}
     }
   }
 ]).exec(function(err, calories){
   if(err){
     callback(err);
   }else{
     if(calories.length === 0){
       callback(null, 0);
     }else{
       var total = 0;
       var count = 0;
       calories.forEach(function(ele){
         total = total + ele.calories;
         count = count + 1;
       });
       callback(null, total*1.0/time_window);
     }
   }
 });
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
