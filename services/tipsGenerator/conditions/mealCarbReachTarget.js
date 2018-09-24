
var functionURL = __filename;
var functionName = 'mealCarbReachTarget';
var returnValue = true;
var functionType = 'meal';

exports.getEntity = function(){
  return {
    functionURL: functionURL,
    functionName: functionName,
    returnValue: returnValue,
    functionType: functionType
  };
};

var mainFunc = function(user, params, callback){
  var mealNutrition = params.mealNutrition;
  var macrosGoal = params.macrosGoal;
  var targetMealCalories = params.profile.targetCalories/4.0;
  var targetMealLowCarbs = (macrosGoal.carbs - 0.1)*targetMealCalories;
  var targetMealHighCarbs = (macrosGoal.carbs + 0.1)*targetMealCalories;
  if(mealNutrition && macrosGoal && (mealNutrition.carb*4 <= targetMealHighCarbs) && (mealNutrition.carb*4 >=targetMealLowCarbs)){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
