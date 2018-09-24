
var functionURL = __filename;
var functionName = 'userProfileDefault';
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
  var defaultLastName = '';
  var defaultFirstName = '';
  var defaultGender = 0;
  var defaultDOB = 1965;
  var defaultWeight = 80.0;
  var defaultHeight = 180.0;
  var defaultWaistSize = 80.0;
  var ProfileCtrl = require('../controllers/profiles.server.controller');
  var profile = params.profile;
  if(profile['dob']=== defaultDOB
  && profile['weight']=== defaultWeight
  && profile['height']=== defaultHeight
  && profile['waistSize']=== defaultWaistSize
  // && profile['lastName'] === defaultLastName
  // && profile['firstName']=== defaultFirstName
  && profile['gender']=== defaultGender){
    callback(null, true);
  }
  else{
    callback(null, false);
  }
}

exports[functionName] = function(user, params, callback){

  return mainFunc(user, params, callback);
};
