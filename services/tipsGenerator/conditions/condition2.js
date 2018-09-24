
var functionURL = __filename;
var functionName = 'condition2';
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

exports[functionName] = function(user, params, callback){
  callback(null, false);
};
