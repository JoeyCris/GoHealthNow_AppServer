/**
 * Created by Canon on 2016-01-05.
 */
var rest = require('restler'),
	crypto = require('crypto');

var sortObj = function(obj) {
	var keys = [];
	var sorted_obj = {};
	for(var k in obj) {
		if(obj.hasOwnProperty(k)) {
			keys.push(k);
		}
	}
	keys.sort();

	keys.forEach(function(key) {
		sorted_obj[key] = obj[key];
	});

	return sorted_obj;
};


var FatSecretAPI = function(obj) {
	var _consumerKey = obj['consumerKey'];
	var _sharedSecret = obj['sharedSecret'];
	var _fatSecretRestUrl = "http://platform.fatsecret.com/rest/server.api";
	var _reqObj = null;
	var _reqObjSorted = null;

	var _method = null;
	var _para = null;

	var setMethod = function(method) {
		_method = method;
	};

	var setPara = function(para) {
		_para = para;
	};

	var _setReqBody = function(obj) {
		for(var k in obj) {
			if(obj.hasOwnProperty(k)) {
				_reqObj[k] = obj[k];
			}
		}
	};

	var _initRequestBody = function() {
		var date = new Date();
		_reqObj = {
			//format: "json",
			method: _method,
			oauth_consumer_key: _consumerKey,
			oauth_nonce: Math.random().toString(36).replace(/[^a-z]/, '').substr(2),
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: Math.floor(date.getTime() / 1000),
			oauth_version: "1.0"
		};
		_reqObjSorted = null;
	};

	var _sign = function(baseMethod) {
		_initRequestBody();
		_setReqBody(_para);
		_reqObjSorted = sortObj(_reqObj);
		var paramsStr = '';

		var rfc3986 = function (str) {
			return str.replace(/[!'()*]/g, function (c) {
				return '%' + c.charCodeAt(0).toString(16).toUpperCase()
			})
		};

		for (var i in _reqObjSorted) {
			paramsStr += "&" + i + "=" + rfc3986(encodeURIComponent(_reqObjSorted[i]));
			//paramsStr += "&" + i + "=" + encodeURIComponent(_reqObjSorted[i]);
		}
		paramsStr = paramsStr.slice(1);

		var encodedParamsStr = encodeURIComponent(paramsStr);

		var sigBaseStr = baseMethod + "&"
			+ encodeURIComponent(_fatSecretRestUrl)
			+ "&"
			+ encodeURIComponent(paramsStr);

		console.log("sig base str = " + sigBaseStr);
		var sharedSecret = _sharedSecret + "&";
		// HMAC SHA1 has
		var hashedBaseStr  = crypto.createHmac('sha1', sharedSecret).update(sigBaseStr).digest('base64');
		//console.log("oauth_sig = " + hashedBaseStr);

		// Add oauth_signature to the request object
		_reqObjSorted.oauth_signature = hashedBaseStr;
	};

	var get = function(callback) {
		_sign("GET");

		console.log("req = " + JSON.stringify(_reqObjSorted));

		rest.get(_fatSecretRestUrl, {
			data: _reqObjSorted,
		}).on('complete', function(result) {
			var err = null;
			//console.log('result:' + result.constructor);

			if(result instanceof Error || result.hasOwnProperty("error") || result.constructor === String) {
				console.log(result);
				err = new Error("Remote Database Internal Error");
			}
			callback(err, result);
		});

	};

	var post = function(callback) {
		_sign("POST");

		rest.post(_fatSecretRestUrl, {
			data: _reqObjSorted,
		}).on('complete', function(result) {
			var err = null;
			if(result instanceof Error || result.hasOwnProperty("error")) {
				err = new Error("Internal Error");
			}
			callback(err, result);
		});
	};


	return {setMethod: setMethod,
		setPara: setPara,
		get: get,
		post: post
	};


};

module.exports = FatSecretAPI;
