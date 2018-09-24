
var functionURL = __filename;
var functionName = 'isAccessCodeDPP';
var returnValue = true;
var functionType = 'dpp';

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
  if(accessCode && accessCode === 'gg-dpp'){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
