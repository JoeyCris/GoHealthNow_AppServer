
var functionURL = __filename;
var functionName = 'isAccessCodeNull1';
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
  var accessCode = params.profile.accessCode;
  var appType='0';
  if(params.profile.appID){
   appType=params.profile.appID;
  }

  if( !accessCode && appType==='1'){
    callback(null, true);
  }else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){
  // var params = {};
  return mainFunc(user, params, callback);
};
