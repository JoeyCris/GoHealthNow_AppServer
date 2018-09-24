/**
 * Module dependencies.
 */
 require('../models/user.activities.server.model');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Activity = mongoose.model('UserActivities');
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

 exports.usedContinuously = function(userID, activityName, target_date, time_window, callback){
	 if(!target_date){
		 target_date = new Date();
	 }
	 if(!time_window){
		 time_window = 7;
	 }
	 if(!activityName){
		 activityName = 'get recommendation';
	 }
	 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
	 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
	 Activity.aggregate([
		 {
			 '$match':{
				 'user':userID, //ObjectId('559d6512179d37bd8ceac753')
				 'activityTime':{'$gte':start,'$lt':end},
				 'activityName':activityName
			 }
		 },{
			 '$group':{
				 _id:{year:{'$year':'$activityTime'},
				 day:{'$dayOfYear':'$activityTime'}},
				 count:{'$sum':1}
			 }
		 }
	 ]).exec(function(err, activities){
		 if(err){
			 callback(err);
		 }else{
			 if(activities.length === time_window){
				 callback(null, true);
			 }else{
				 callback(null, false);
			 }
		 }
	 });
};

exports.inactiveContinuously = function(userID, activityName, target_date, time_window, callback){
	if(!target_date){
		target_date = new Date();
	}
	if(!time_window){
		time_window = 7;
	}
	if(!activityName){
		activityName = 'get recommendation';
	}
	var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
	var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);

	Activity.find(
		{
			'user':userID, //ObjectId('559d6512179d37bd8ceac753')
			'activityTime':{'$gte':start,'$lt':end},
			'activityName':activityName
		}
	).sort({'activityTime': -1}).limit(1).exec(function(err, activities){
		if(err){
			callback(err);
		}else{
			if(activities.length > 0){
				callback(null, false);
			}else{
				callback(null, true);
			}
		}
	});
};

exports.usedContinuouslyCount = function(userID, activityName, target_date, time_window, callback){
  if(!target_date){
    target_date = new Date();
  }
  if(!time_window){
    time_window = 30;
  }
  if(!activityName){
    activityName = 'get recommendation';
  }
  var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate());
  var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
  Activity.aggregate([
    {
      '$match':{
        'user':userID, //ObjectId('559d6512179d37bd8ceac753')
        'activityTime':{'$gte':start,'$lt':end},
        'activityName':activityName
      }
    },{
      '$group':{
        _id:{year:{'$year':'$activityTime'},
        day:{'$dayOfYear':'$activityTime'}},
        count:{'$sum':1}
      }
    },{
      '$sort':{'_id.day':-1}
    }
  ]).exec(function(err, activities){
    if(err){
      callback(err);
    }else{

      if(activities.length === 0){
        callback(null, 0);
      }else{
        var continouslyCount = 0;
        var lastCount = activities[0]._id.day;
        activities.forEach(function(ele,ind,arr){
          if(lastCount === ele._id.day){
            continouslyCount = continouslyCount + 1;
          };
          lastCount = lastCount - 1;
        });
        callback(null, continouslyCount);
      }
    }
  });
};

exports.inactiveContinuouslyCount = function(userID, activityName, target_date, time_window, callback){
 if(!target_date){
   target_date = new Date();
 }
 if(!time_window){
   time_window = 7;
 }
 if(!activityName){
   activityName = 'get recommendation';
 }
 var end = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()+1);
 var start = new Date(target_date.getFullYear(), target_date.getMonth(), target_date.getDate()-time_window);
 Activity.find({'user':userID,'activityName':activityName,'activityTime':{'$lte':end}}).sort({'activityTime':-1}).limit(1).exec(function(err, activities){
   if(err){
     callback(err);
   }else{
     console.log('activities: ', activities, end);
     if(activities.length === 0){
       callback(null, 100000);
     }else{
       var first = activities[0].activityTime;
       var second = new Date();
       var daysDiff = Math.round((second-first)/(1000*60*60*24));
       console.log(daysDiff)
       callback(null, daysDiff);
     }
   }
 });
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

};
