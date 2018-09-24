
var functionURL = __filename;
var functionName = 'usedContinuously';
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
  var continouslyCount = params.usedContinuously;
  if(continouslyCount>=7){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {'time_window':7, 'activity_name':'get recommendation'};
  return mainFunc(user, params, callback);
};
