
var functionURL = __filename;
var functionName = 'inactiveForDays';
var returnValue = true;
var functionType = 'inactive';

exports.getEntity = function(){
  return {
    functionURL: functionURL,
    functionName: functionName,
    returnValue: returnValue,
    functionType: functionType
  };
};

var mainFunc = function(user, params, callback){
  var continouslyCount = params.inactiveContinuously;
  if(continouslyCount>1 && continouslyCount % 4 === 0){
    // console.log('inactive!!!!')
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {'time_window':7, 'activity_name':'get recommendation'};
  // console.log(params.inactiveContinuously);
  mainFunc(user, params, callback);
};
