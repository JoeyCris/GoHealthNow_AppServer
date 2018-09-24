var username = 'glucoguide';
var password = 'glucoguide_2015';

var request = require('request');
var sendRequest = require('../util/sendRequest');
var cookie;

var getCookie = function(callback){
  if(!cookie){
    callback(cookie);
  }else{
    login(function(cookie){
      callback(cookie);
    });
  }
};

var removeCookie = function(){
  cookie = undefined;
};

var login = function(callback){
  sendRequest.sendPostRequest('auth/signin',{form:{username: username, password: password }},function(err, response, data){
    if(err){
      console.error(err);
    }else{
      var creator = JSON.parse(data);
      var login_cookie = response.headers['set-cookie'][0];
      cookie = login_cookie;
      console.log(login_cookie);
      callback(login_cookie, creator);
    }

  });
};

module.exports = {
  getCookie : getCookie,
  removeCookie : removeCookie,
  login : login
}
