'use strict'

var request = require('request');

/**
* send push notification middleware
*/
var sendPush = function(res, user, pushContent){

	var pushServerUrl = 'http://localhost:30000/pushserver/gcm/';
	//var pushContent = 'new message from glucoguide';
	var registrationID = user.registrationID;
	var appID= user.appID;
	var deviceType = user.deviceType;
	// console.log(pushContent);
	if(!deviceType || deviceType == 0){
		pushServerUrl = 'http://localhost:30000/pushserver/gcm/';
		request.post(
		    pushServerUrl, {
					form: {
					 	regid: registrationID,
						apikey : 'AIzaSyA-MAQ-BT96Cvmoa_lGHtyWOnM-H9BuWFk',
						mes: pushContent
					}
				},
		    function (error, response, body) {
		        if (!error && response.statusCode === 200) {
								// console.log('Push notification for GCM sending success');
								return 'Push notification for GCM sending success'
		        }else{
							if(error){
								console.error('Push notification for APN sending failed: ', error.message);
							}
							return 'Push notification for GCM sending failed';
						}
		    }
		);
	}
	else if(deviceType==1){
		pushServerUrl = 'http://localhost:30000/pushserver/apn/';
		request.post(
		    pushServerUrl, {
					form: {
					 	token: registrationID,
						mes: pushContent,
						appid: appID
					}
				},
		    function (error, response, body) {
		        if (!error && response.statusCode === 200) {
							// console.log('Push notification for APN sending success');
							return 'Push notification for APN sending success';
		        }else{
							if(error){
								console.error('Push notification for APN sending failed: ', error.message);
							}
							return 'Push notification for APN sending failed';
					}
		    }
		);
	}else{
		return 'No suitable push service for this kind of device';
	}
};

module.exports = sendPush;
