
var functionURL = __filename;
var functionName = 'condition1';
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
  callback(null, true);
};
