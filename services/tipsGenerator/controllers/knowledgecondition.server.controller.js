/**
 * Module dependencies.
 */
 require('../models/knowledgecondition');
var mongoose = require('mongoose'),
	_ = require('lodash'),
  async = require('async'),
	KCondition = mongoose.model('KnowledgeCondition');
var ProfileCtrl = require('./profiles.server.controller');
var TopicCtrl = require('./topics.server.controller');
var ActivityCtrl = require('./activities.server.controller');
var MealCtrl = require('./meals.server.controller');
var ExerciseCtrl = require('./exercises.server.controller');
var GoalCtrl = require('./goals.server.controller');
var ReminderCtrl = require('./reminders.server.controller');
var ConditionFunctions = require('./conditionfunction.server.controller');

exports.initial_user_data = function(user, done){
  var userID = user.userID;
  var target_date = user.target_date;
  // console.log(user);
  if(!target_date){
    target_date = new Date();
  }
  var time_window = user.time_window;
  if(time_window){
    time_window = 1;
  }
  async.parallel({
      profile: function(callback){
          // console.log(1);
          ProfileCtrl.profileByID(mongoose.Types.ObjectId(userID),callback);
      },
      mealScore : function(callback) {
          // console.log(2);
          MealCtrl.getDailyAverageMealScore(mongoose.Types.ObjectId(userID), target_date, time_window, callback);
      },
      mealCount: function(callback) {
        // console.log(3);
          MealCtrl.getDailyMealLogsCounts(mongoose.Types.ObjectId(userID), target_date, time_window, callback);
      },
      mealNutrition: function(callback) {
        // console.log(4);
          MealCtrl.getDailyMealNutrition(mongoose.Types.ObjectId(userID), target_date, time_window, callback);
      },
      stepCount : function(callback) {
        // console.log(5);
          ExerciseCtrl.getDailyAverageStepCount(mongoose.Types.ObjectId(userID), target_date, time_window, callback);
      },
      pCal : function(callback) {
        // console.log(6);
          ExerciseCtrl.getDailyAveragePedometerCalory(mongoose.Types.ObjectId(userID), target_date, time_window, callback);
      },
      mCal : function(callback) {
        // console.log(7);
          ExerciseCtrl.getDailyAverageManualInputCalory(mongoose.Types.ObjectId(userID), target_date, time_window, callback);
      },
      stepCountGoal: function(callback) {
        // console.log(8);
          GoalCtrl.getDailyStepCountGoal(mongoose.Types.ObjectId(userID), callback);
      },
      macrosGoal: function(callback) {
        // console.log(9);
          GoalCtrl.getMacrosGoal(mongoose.Types.ObjectId(userID), callback);
      },
      inactiveContinuously: function(callback) {
        // console.log(10);
          ActivityCtrl.inactiveContinuouslyCount(userID, 'get recommendation', target_date, 30, callback);
      },
      usedContinuously: function(callback) {
        // console.log(11);
          ActivityCtrl.usedContinuouslyCount(userID, 'get recommendation', target_date, time_window, callback);
      },
      reminderCount: function(callback) {
        // console.log(12);
          ReminderCtrl.reminderCount(userID, callback);
      }
  }, function(err, data){
    if(err){
      done(err);
    }else{
      data.stepCountGoalTemp = Math.ceil(data.stepCount/500.0)*500 + 1000;
      done(null,data);
    }
  });
};

exports.initial_user_data_for_meal = function(user, done){
  var userID = user.userID;
  var target_date = user.target_date;
  var meal = user.meal;
  // console.log(user);
  if(!target_date){
    target_date = new Date();
  }
  var time_window = user.time_window;
  if(time_window){
    time_window = 1;
  }
  async.parallel({
      profile: function(callback){
          // console.log(1);
          ProfileCtrl.profileByID(mongoose.Types.ObjectId(userID),callback);
      },
      mealScore : function(callback) {
        // console.log(3);
          if(meal){
            callback(null,Math.round(parseFloat(meal.mealScore)));
          }else{
            callback(null,0);
          }
      },
      mealCount: function(callback) {
        // console.log(3);
          if(meal){
            callback(null,1);
          }else{
            callback(null,0);
          }
      },
      mealNutrition: function(callback) {
        // console.log(3);
          if(meal){
            var returnMeal = {};
            returnMeal.carb = parseFloat(meal.carb);
            returnMeal.fibre = parseFloat(meal.fibre);
            returnMeal.pro = parseFloat(meal.pro);
            returnMeal.fat = parseFloat(meal.fat);
            returnMeal.cals = parseFloat(meal.cals);
            returnMeal.mealID = meal.mealID;
            returnMeal.food_Records = meal.food_Records;
            returnMeal.mealType = meal.mealType;
            returnMeal.mealName = meal.mealName;
            returnMeal.recordedTime = meal.recordedTime;
            callback(null,returnMeal);
          }
      },
      macrosGoal: function(callback) {
        // console.log(9);
          GoalCtrl.getMacrosGoal(mongoose.Types.ObjectId(userID), callback);
      }
  }, function(err, data){
    if(err){
      done(err);
    }else{
      // data.stepCountGoalTemp = Math.ceil(data.stepCount/500.0)*500 + 1000;
      done(null,data);
    }
  });
};

var getKnowledgeByConditions = function(conditions, callback){
  // console.log(conditions);

  KCondition.find({$or:[{conditions:{$not:{$elemMatch:{$nin:conditions}}}},{conditions:[]}]},function(err, kconditions){
    if(err){
      console.error(err);
    }else{
      results = [];
      kconditions.forEach(function(kcondition){
        results.push(kcondition.knowledgeId);
      });
      // console.log(kconditions);
      callback(err, results);
    }
  });
};

var getGroupedKnowledgesByConditions = function(conditions, callback){
  // console.log(conditions);

  KCondition.aggregate([
    {'$match':{conditions:{$not:{$elemMatch:{$nin:conditions}}}}},
    {'$match':{conditions:{$ne:[]}}},
    {'$group':{'_id':'$conditions','count':{'$sum':1}}}
  ],function(err, groupedconditions){
    if(err){
      console.error(err);
    }else{
      var results = [];
      // console.log(groupedconditions);
      async.each(groupedconditions, function(groupedcondition, done) {
        KCondition.find({conditions:groupedcondition._id}).exec(function(err, kconditions){
          var select_index = Math.floor(Math.random()*kconditions.length);
          // console.log(kcondition[0]);
          // console.log(kcondition[0].knowledgeId);
          results.push(kconditions[select_index].knowledgeId);
          // console.log(results);
          done();
        });
      },function done(err){
        // console.log(results);
        callback(err,results);
      });
      // console.log(kconditions);
      // callback(err, results);
    }
  });
};

exports.checkConditions = function(user, callback) {
  var conditions = [];
  ConditionFunctions.listName(function(err, names){
    ConditionFunctions.list(function(err, conditionfunctions){
      async.each(Object.keys(conditionfunctions), function(id, done) {
          // console.log(names[id]);
          conditionfunctions[id](user.userID, user, function(err, condition){
            // console.log(condition);
            if(condition){
              console.log(names[id]+": TRUE");
              conditions.push(mongoose.Types.ObjectId(id));
            }
            // console.log(id+" : "+condition);
            done();
          });
      }, function done(err){
        // console.log(err,conditions);
        // if any of the file processing produced an error, err would equal that error
        if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('A condition failed to process');
        } else {
          console.log('All conditions have been processed successfully');
          // console.log(typeof(conditions[0]));
          getKnowledgeByConditions(conditions, callback);
        }
      });
    });
  });
};

exports.checkConditionsByType = function(user, type, callback) {
  var conditions = [];
  ConditionFunctions.listName(function(err, names){
    ConditionFunctions.listByType(type, function(err, conditionfunctions){
      async.each(Object.keys(conditionfunctions), function(id, done) {
          conditionfunctions[id](user.userID, user, function(err, condition){
            // console.log(condition);
            if(condition){
              console.log(names[id]+": TRUE");
              conditions.push(mongoose.Types.ObjectId(id));
            }
            // console.log(names[id]+" : "+condition);
            done();
          });
      }, function done(err){
        // console.log(err,conditions);
        // if any of the file processing produced an error, err would equal that error
        if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('A condition failed to process');
        } else {
          console.log('All conditions have been processed successfully');
          // console.log(typeof(conditions[0]));
          getGroupedKnowledgesByConditions(conditions, callback);
        }
      });
    });
  });
};

exports.checkConditionsByTypeAll = function(user, type, callback) {
  var conditions = [];
  ConditionFunctions.listName(function(err, names){
    ConditionFunctions.listByType(type, function(err, conditionfunctions){
      async.each(Object.keys(conditionfunctions), function(id, done) {
          conditionfunctions[id](user.userID, user, function(err, condition){
            //console.log('!!!!!!!!This is conditon: ',condition);
            if(condition && names[id] !== 'isAccessCodeNull'){
              console.log(names[id]+": TRUE");
              conditions.push(mongoose.Types.ObjectId(id));
            }
            // console.log(id+" : "+condition);
            done();
          });
      }, function done(err){
        // console.log(err,conditions);
        // if any of the file processing produced an error, err would equal that error
        if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('A condition failed to process');
        } else {
          console.log('All conditions have been processed successfully');
          // console.log(typeof(conditions[0]));
          getKnowledgeByConditions(conditions, callback);
        }
      });
    });
  });
};

var kconditionByKnowledgeId = function(knowledgeId, callback) {

	 KCondition.findOne({knowledgeId:knowledgeId}).exec(function(err, kcondition){
		 if (err) {
			 return callback(err);
		 }
		 if (!kcondition) {
			 kcondition = new KCondition({knowledgeId:knowledgeId,conditions:[]});
			 kcondition.save(function(err) {
				 if (err) {
					 callback(err);
				 }else{
					 callback(null, kcondition);
				 }
			 });
		 }else{
			 callback(null, kcondition);
		 }
	 });
};

/**
 * Create Knowledge Condtion
 * tested
 */
 exports.create = function(knowledgecondition, callback) {
 	var kcondition = new KCondition(knowledgecondition);
 	kcondition.save(function(err) {
 		if (err) {
 			callback(err);
 		} else {
			callback(null, kcondition);
 		}
 	});
 };

 /**
  * Update a knowledge condtion
  */
 exports.update = function( knowledgecondition, callback) {
 	//var khistory = KHistory();
  KCondition.findOne({knowledgeId:knowledgecondition.knowledgeId},function(err, kcondition){
    if(err){
      callback(err);
    }else {
      // console.log(kcondition);
      if(kcondition){
        kcondition = _.extend(kcondition, knowledgecondition);
      }else{
        kcondition = new KCondition(knowledgecondition);
      }

      kcondition.save(callback);
    }
  });
 };


 /**
 * Read knowledge condtion by knowledgeID
 */

 exports.read = function(knowledgeId, callback){
   if(BSON.ObjectID.isValid(knowledgeId)){
     KCondition.findOne({knowledgeId:mongoose.Type.ObjectId(knowledgeId)}, callback);
   }
};

 /**
  * Delete a knowledge condition
  */
 exports.delete = function(kcondition, callback) {
 	kcondition.remove(callback);
 };

 /**
  * List of knowledge conditions
  */
 exports.list = function(callback) {
 	KCondition.find({}, function(err, kcondition) {
 		if (err) {
 			return callback(err);
 		} else {
 			return callback(null, kcondition);
 		}
 	});
 };

 /**
  * knowledge history middleware
  */
 exports.kconditionByKnowledgeId = kconditionByKnowledgeId;

// exports.generateTip = function(req, res) {
// 	var cp = require('child_process');
// 	var n = cp.fork('./app/controllers/test.server.js');
// 	n.on('message', function(m) {
// 		console.log('PARENT got message:', m);
// 	});
// 	n.send({ hello: 'world' });
// 	// var tips = generateTipForUsers(function(){
// 	// 	res.json({message:'generate tip'});
// 	// });
// };
