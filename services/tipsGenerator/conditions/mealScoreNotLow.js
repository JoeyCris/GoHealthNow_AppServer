
var functionURL = __filename;
var functionName = 'mealScoreNotLow';
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
  var mealScore = params.mealScore;
  if(mealScore >= 50){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
