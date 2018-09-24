
var functionURL = __filename;
var functionName = 'isAccessCodeNull';
var returnValue = true;
var functionType = 'nonacscode';

exports.getEntity = function(){
  return {
    functionURL: functionURL,
    functionName: functionName,
    returnValue: returnValue,
    functionType: functionType
  };
};

var mainFunc = function(user, params, callback){
  var accessCode = params.profile.accessCode;

  if( !accessCode ){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
