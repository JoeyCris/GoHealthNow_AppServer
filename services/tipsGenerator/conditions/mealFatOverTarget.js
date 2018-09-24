
var functionURL = __filename;
var functionName = 'mealFatOverTarget';
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
  var targetMealFat = macrosGoal.fat*targetMealCalories;
  if(mealNutrition && macrosGoal && (mealNutrition.fat*9 > targetMealFat)){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
