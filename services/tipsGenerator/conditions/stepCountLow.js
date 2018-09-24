
var functionURL = __filename;
var functionName = 'stepCountLow';
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
  if(stepCount>0 && stepCount < 1000){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
