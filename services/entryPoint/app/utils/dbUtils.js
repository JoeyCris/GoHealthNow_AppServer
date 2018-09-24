/**
 * Created by robertwang on 16-03-02.
 */
'use strict'

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ObjectId = mongoose.Types.ObjectId;


//var Sleep = mongoose.model('Sleep'),
//	Exercise = mongoose.model('Exercise'),
//	Note = mongoose.model('Note'),
//	Weight = mongoose.model('Weight'),
//	A1C = mongoose.model('A1C'),
//	Glucose = mongoose.model('Glucose'),
//	Meal = mongoose.model('Meal'),
//	FoodItem = mongoose.model('FoodItem'),
//	Question = mongoose.model('Question'),
//	Topic = mongoose.model('Topic'),
//	InsulinType = mongoose.model('InsulinType'),
//	Insulin = mongoose.model('Insulin'),
//	MedicineType = mongoose.model('MedicineType'),
//	Medicine = mongoose.model('Medicine'),
//	Goal = mongoose.model('Goal');

var hashCode = function(s){
	var hash = 0, i, chr, len;
	if (s.length == 0) return hash;
	for (i = 0, len = s.length; i < len; i++) {
		chr   = s.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	var ret = '00000000' + (hash >>> 0).toString(16);
	return ret.slice(ret.length - 8);


};

var isValidUUID = function (str) {
	var pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i ;
	return pattern.test(str);
};

var genObjectId = function(userID, uuid) {
	if(isValidUUID(uuid)) {
		var str = userID.substr(0,8) + hashCode(userID + uuid) + uuid.substr(0, 8);
		//console.log('create oid with :' + str);

		return ObjectId(str);
	} else {
		console.log('invalid uuid:' + uuid + '. create a new objectid');
		return ObjectId();
	}
};

exports.genObjectId = genObjectId;
exports.hashCode = hashCode;

exports.generateUUID = function(){
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
};

exports.addOneRecordToDB = function(userID, data, modelName, callback) {

	//console.log('add record: ' + JSON.stringify(data));

	data.userID = userID;
	data._id = genObjectId(userID, data.uuid);

	//var record = new (eval(modelName))(data); // jshint ignore:line
	var Model = mongoose.model(modelName);
	var record = new Model(data);

	//mongoose.model(modelName).update({_id:record._id, recordedTime:{$lt:record.recordedTime}},record, {upsert:true}, function(err){

	mongoose.model(modelName).findByIdAndUpdate(record._id,{$set: record}, {upsert:true}, function(err,dbData){
		if(err) {
			console.error(JSON.stringify(err));
			console.error('failed to add record:' + JSON.stringify(record));
			console.error('userID:' + JSON.stringify(userID) + ' Type:' + modelName + ' data:' + JSON.stringify(data) );

			if(callback) {
				callback(err, dbData);
			}
		} else {
			if(callback) {
				callback(null, dbData);
			}
		}

	});

}

