
var functionURL = __filename;
var functionName = 'mealCarbOverTarget';
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
  var targetMealHighCarbs = (macrosGoal.carbs + 0.1)*targetMealCalories;
  if(mealNutrition && macrosGoal && (mealNutrition.carb*4 > targetMealHighCarbs)){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
