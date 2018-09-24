
var functionURL = __filename;
var functionName = 'stepCountCloseToTarget';
var returnValue = true;
var functionType = 'exercise';

exports.getEntity = function(){
  return {
    functionURL: functionURL,
    functionName: functionName,
    returnValue: returnValue,
    functionType: functionType
  };
};

var mainFunc = function(user, params, callback){
  var stepCount = params.stepCount;
  var stepCountGoal = params.stepCountGoal;
  if(stepCountGoal - stepCount <= 500 && stepCountGoal > stepCount && stepCount > 0){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
