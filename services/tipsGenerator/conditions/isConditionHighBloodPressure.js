
var functionURL = __filename;
var functionName = 'isConditionHighBloodPressure';
var returnValue = true;
var functionType = 'type';

exports.getEntity = function(){
  return {
    functionURL: functionURL,
    functionName: functionName,
    returnValue: returnValue,
    functionType: functionType
  };
};

var mainFunc = function(user, params, callback){
  var condition = params.profile.conditions.condition;
  var matched = false;
  if(!condition){
    callback(null, matched);
    return;
  }
  condition.forEach(function(c){
    if(c === 1){
      matched = true;
    }
    return;
  });
  callback(null, matched);
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
