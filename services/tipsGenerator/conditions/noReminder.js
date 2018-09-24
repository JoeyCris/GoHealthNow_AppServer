
var functionURL = __filename;
var functionName = 'noReminder';
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
  var reminderCount = params.reminderCount;
  if(reminderCount === 0){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
