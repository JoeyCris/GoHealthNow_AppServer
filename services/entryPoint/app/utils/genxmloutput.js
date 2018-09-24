'use strict'

var xml2js = require('xml2js');

// var keyDict = {
// 	'logintype': 'LoginType',
// 	'userid': 'UserID',
// 	'email': 'Email',
// 	'password': 'Password',
// 	'registrationid':'RegistrationID',
// 	'devicetype':'DeviceType',
// 	'gender':'Gender',
// 	'dob':'DOB',
// 	'weight':'Weight',
// 	'calorytarget_records':'CaloryTarget_Records',
// 	'a1c': 'A1C',
// 	'height':'Height',
// 	'registrationtime':'RegistrationTime'
// }

function getReturnKey(originalKey) {
	if(originalKey === 'dob' || originalKey === 'bmi') {
		return originalKey.toUpperCase();
	}
	if(originalKey === 'deviceID' || originalKey === 'deviceGoalID') {
		return 'Uuid';
	}
	var newKey = originalKey.charAt(0).toUpperCase() + originalKey.slice(1);
	return newKey;
}

function keymap(obj) {
	if(typeof(obj) !== 'object') {
		return;
	}

	for(var pro in obj) {
		if(obj.hasOwnProperty(pro)) {
			// console.log(obj);
			var swap = obj[pro];
			var newKey = getReturnKey(pro);
			if(newKey !== pro) {
				obj[newKey] = obj[pro];
				delete obj[pro];
				pro = newKey;

			}

			if(typeof(obj[pro]) === 'object') {
				keymap(obj[pro]);
			}
		}
	}
}

function genXmlOutput(rootTag, jsonObj, renderOpts) {
	if(!renderOpts) {
		//default renderOpts
		renderOpts = { 'pretty': true, 'indent': ' ', 'newline': '\n' };
	}
//////////////////
	function dateReplacer(key, value) {


		if (Object.prototype.toString.call(value) === '[object String]') {

			//console.log('key: ' + key + ' value: ' + value);

			//'2015-09-03T20:06:20.683Z'
			if(value.match(
					/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
				)) {

				return value.split('.')[0] + '+0000';
			}
		}


		return value;

	}

	var jsonobj = JSON.parse(JSON.stringify(jsonObj), dateReplacer);
	// console.log(jsonobj);

	var ret = {};

	ret[rootTag] = jsonobj;
	keymap(ret);

	var builder = new xml2js.Builder(
		{ headless:true,
	      renderOpts: renderOpts
	    });
	var xml = builder.buildObject(ret);

	//console.log(xml);
	return xml;
//*/
/*
	if (typeof Date.prototype.toISOString === 'function') {
		(function () {
			// Function which takes a 1 or 2-digit number and returns it as a two-character string,
			// padded with an extra leading zero, if necessary.
			function pad(number) {
				var r = String(number);
				if (r.length === 1) {
					r = '0' + r;
				}
				return r;
			}

			Date.prototype.toISOString = function () {
				return this.getUTCFullYear()
					+ '-' + pad(this.getUTCMonth() + 1)
					+ '-' + pad(this.getUTCDate())
					+ 'T' + pad(this.getUTCHours())
					+ ':' + pad(this.getUTCMinutes())
					+ ':' + pad(this.getUTCSeconds())
						//+ '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
					+ 'Z';
			};
		}());
	}

	var jsonobj = JSON.parse(JSON.stringify(jsonObj));
	var ret = {};

	ret[rootTag] = jsonobj;
	keymap(ret);

	var builder = new xml2js.Builder(
		{ headless:true,
			// renderOpts: { 'pretty': false, 'indent': '', 'newline': '' }
		});
	var xml = builder.buildObject(ret);

	//console.log(xml);
	return xml;

	*/
}

module.exports = genXmlOutput;
