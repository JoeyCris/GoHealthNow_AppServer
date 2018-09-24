
var request = require('request');

var server_url = 'http://localhost:3000/';

if (process.env && process.env.NODE_ENV==='test') {
	server_url = 'http://localhost:3001/';
}
console.log(server_url);

var sendPostRequest = function(url, postData, callback){
	console.log(url);
	var dest_url = server_url+url;
	request.post(
			dest_url, postData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('post request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};

var sendGetRequest = function(url, getData, callback){
	//console.log(url);
	var dest_url = server_url+url;
	request.get(
			dest_url, getData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('get request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};

var sendPutRequest = function(url, putData, callback){
	console.log(url);
	var dest_url = server_url+url;
	request.put(
			dest_url, putData,
			function (error, response, body) {
					if (!error && response.statusCode === 200) {
						// console.log(body);
						callback(error, response, body);
					}else{
						console.log('put request to '+url+' failed');
						callback(error, response, body);
					}
			}
	);
};

module.exports = {
                    sendPostRequest: sendPostRequest,
                    sendGetRequest: sendGetRequest,
                    sendPutRequest: sendPutRequest
                 };

//module.exports = sendPostRequest;
