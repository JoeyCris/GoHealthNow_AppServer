/**
 * Created by robert on 2016-12-15.
 */

'use strict'

var request = require('request');

//request.debug = true;


//api key key = AIzaSyAPwX7z_xU7v4I8mx7G6zN38EZ813dHmSQ


//https://cloud.google.com/translate/docs/reference/rest#query_parameters
//
//https://translation.googleapis.com/language/translate/v2?
// format=text&key=AIzaSyAPwX7z_xU7v4I8mx7G6zN38EZ813dHmSQ&source=en&target=fr&q=Hello
//
//https://translation.googleapis.com/language/translate/v2?
// format=text&
// key=AIzaSyAPwX7z_xU7v4I8mx7G6zN38EZ813dHmSQ&
// source=en &
// target=fr &
// q=Hello
//
//{
//	"data": {
//	"translations": [
//		{
//			"translatedText": "Bonjour"
//		}
//	]
//}
//}

exports.translate = function(content, source, target, callback) {
// https://api.nutritionix.com/v1_1/item?upc=49000036756&appId=[YOURID]&appKey=[YOURKEY]

	var rootURL = 'https://translation.googleapis.com/language/translate/v2';


	var s = source || 'en';
	var t = target || 'fr';

	request.get(
		{
			url:rootURL,
			qs: {
				 format:'text',
				 key: 'AIzaSyAPwX7z_xU7v4I8mx7G6zN38EZ813dHmSQ',
				 source: s,
				 target: t,
				 q: content
			}
		},
		function (error, response, body) {

			var translatedText='';
			if(! error) {
				var res = JSON.parse(body);
				translatedText = res.data.translations[0];
			}


			callback(error,translatedText);
		}
	);
};
