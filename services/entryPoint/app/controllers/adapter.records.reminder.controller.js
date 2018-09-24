///**
// * Created by robert on 03/03/16.
// */
'use strict';
//
//
//var addOrUpdateMedicineReminderRecord = function(userID, record, res, callback, isLast) {
//
//	MedicineReminder.findOne({uuid:record.uuid}).exec(function(err,data){
//		var medicineReminderRecord = data;
//		if(err || !data){
//			// console.log(err,data);
//			// if (isLast) callback(err, {message:'save medicine record failed.'});
//			//console.log('Create new medicine reminder record');
//			medicineReminderRecord = new MedicineReminder();
//
//		}
//		medicineReminderRecord.userID = userID;
//		medicineReminderRecord.uuid = record.uuid;
//		medicineReminderRecord.dose = record.dose;
//		medicineReminderRecord.unit = record.unit;
//		medicineReminderRecord.medicineID = record.medicineID;
//		medicineReminderRecord.medicineName = record.medicineName;
//		medicineReminderRecord.medicineType = record.medicineType;
//		medicineReminderRecord.reminderTime = record.reminderTime;
//		medicineReminderRecord.repeatType = record.repeatType;
//		medicineReminderRecord.recordedTime = new Date(record.recordedTime);
//
//		medicineReminderRecord.save(function(err){
//			if (isLast) callback(err, {message:'save medicine reminder record failed.'});
//		});
//	});
//};
//
//var addOrUpdateBloodGlucoseReminderRecord = function(userID, record, res, callback, isLast) {
//
//	BloodGlucoseReminder.findOne({uuid:record.uuid}).exec(function(err,data){
//		var bloodGlucoseReminderRecord = data;
//		if(err || !data){
//			// console.log(err,data);
//			// if (isLast) callback(err, {message:'save medicine record failed.'});
//			//console.log('Create new blood glucose reminder record');
//			bloodGlucoseReminderRecord = new BloodGlucoseReminder();
//
//		}
//		bloodGlucoseReminderRecord.userID = userID;
//		bloodGlucoseReminderRecord.uuid = record.uuid;
//		bloodGlucoseReminderRecord.glucoseType = record.glucoseType;
//		bloodGlucoseReminderRecord.reminderTime = record.reminderTime;
//		bloodGlucoseReminderRecord.repeatType = record.repeatType;
//		bloodGlucoseReminderRecord.recordedTime = new Date(record.recordedTime);
//
//		bloodGlucoseReminderRecord.save(function(err){
//			if (isLast) callback(err, {message:'save blood glucose reminder record failed.'});
//		});
//	});
//};
//
//var addOrUpdateExerciseReminderRecord = function(userID, record, res, callback, isLast) {
//
//	ExerciseReminder.findOne({uuid:record.uuid}).exec(function(err,data){
//		var exerciseReminderRecord = data;
//		if(err || !data){
//			// console.log(err,data);
//			// if (isLast) callback(err, {message:'save medicine record failed.'});
//			//console.log('Create new exercise reminder record');
//			exerciseReminderRecord = new ExerciseReminder();
//
//		}
//		exerciseReminderRecord.userID = userID;
//		exerciseReminderRecord.uuid = record.uuid;
//		exerciseReminderRecord.glucoseType = record.exerciseType;
//		exerciseReminderRecord.reminderTime = record.reminderTime;
//		exerciseReminderRecord.repeatType = record.repeatType;
//		exerciseReminderRecord.recordedTime = new Date(record.recordedTime);
//
//		exerciseReminderRecord.save(function(err){
//			if (isLast) callback(err, {message:'save exercise reminder record failed.'});
//		});
//	});
//};
//
//var addOrUpdateMealReminderRecord = function(userID, record, res, callback, isLast) {
//
//	MealReminder.findOne({uuid:record.uuid}).exec(function(err,data){
//		var mealReminderRecord = data;
//		if(err || !data){
//			// console.log(err,data);
//			// if (isLast) callback(err, {message:'save medicine record failed.'});
//			//console.log('Create new meal reminder record');
//			mealReminderRecord = new MealReminder();
//
//		}
//		mealReminderRecord.userID = userID;
//		mealReminderRecord.uuid = record.uuid;
//		mealReminderRecord.glucoseType = record.mealType;
//		mealReminderRecord.reminderTime = record.reminderTime;
//		mealReminderRecord.repeatType = record.repeatType;
//		mealReminderRecord.recordedTime = new Date(record.recordedTime);
//
//		mealReminderRecord.save(function(err){
//			if (isLast) callback(err, {message:'save meal reminder record failed.'});
//		});
//	});
//};
//
//
//var addOrUpdateReminderRecord = function(userID, records, res, callback) {
//	var isLast = false;
//	var reminderTotalCount = 0;
//	if(records.medication){
//		if(records.medication.length)
//			reminderTotalCount += records.medication.length;
//		else
//			reminderTotalCount++;
//		// console.log(records.medication.length);
//	}
//	if(records.bloodGlucose){
//		if(records.bloodGlucose.length)
//			reminderTotalCount += records.bloodGlucose.length;
//		else
//			reminderTotalCount++;
//	}
//	if(records.exercise){
//		if(records.exercise.length)
//			reminderTotalCount += records.exercise.length;
//		else
//			reminderTotalCount++;
//	}
//	if(records.meal){
//		if(records.meal.length)
//			reminderTotalCount += records.meal.length;
//		else
//			reminderTotalCount++;
//	}
//	//console.log(reminderTotalCount);
//	var reminderCount = 0;
//	if(records.medication){
//		if( Object.prototype.toString.call( records.medication ) === '[object Array]') {
//			records.medication.forEach( function(data, index) {
//				reminderCount++;
//				isLast = reminderCount === reminderTotalCount;
//				addOrUpdateMedicineReminderRecord(userID, data, res, callback, isLast);
//			});
//		} else {
//			reminderCount++;
//			isLast = reminderCount === reminderTotalCount;
//			addOrUpdateMedicineReminderRecord(userID, records.medication, res, callback, isLast);
//		}
//	}
//	if(records.bloodGlucose){
//		if( Object.prototype.toString.call( records.bloodGlucose ) === '[object Array]') {
//			records.bloodGlucose.forEach( function(data, index) {
//				reminderCount++;
//				isLast = reminderCount === reminderTotalCount;
//				addOrUpdateBloodGlucoseReminderRecord(userID, data, res, callback, isLast);
//			});
//		} else {
//			reminderCount++;
//			isLast = reminderCount === reminderTotalCount;
//			addOrUpdateBloodGlucoseReminderRecord(userID, records.bloodGlucose, res, callback, isLast);
//		}
//	}
//	if(records.exercise){
//		if( Object.prototype.toString.call( records.exercise ) === '[object Array]') {
//			records.exercise.forEach( function(data, index) {
//				reminderCount++;
//				isLast = reminderCount === reminderTotalCount;
//				addOrUpdateExerciseReminderRecord(userID, data, res, callback, isLast);
//			});
//		} else {
//			reminderCount++;
//			isLast = reminderCount === reminderTotalCount;
//			addOrUpdateExerciseReminderRecord(userID, records.exercise, res, callback, isLast);
//		}
//	}
//	if(records.meal){
//		if( Object.prototype.toString.call( records.meal ) === '[object Array]') {
//			records.meal.forEach( function(data, index) {
//				reminderCount++;
//				isLast = reminderCount === reminderTotalCount;
//				addOrUpdateMealReminderRecord(userID, data, res, callback, isLast);
//			});
//		} else {
//			reminderCount++;
//			isLast = reminderCount === reminderTotalCount;
//			addOrUpdateMealReminderRecord(userID, records.meal, res, callback, isLast);
//		}
//	}
//
//	// if( Object.prototype.toString.call( records ) === '[object Array]') {
//	// 	records.forEach( function(data, index) {
//	// 		var isLast = index === records.length-1;
//	// 		addOrUpdateOneReminderRecord(userID, data, res, callback, isLast);
//	// 	});
//	// } else {
//	// 	addOrUpdateOneReminderRecord(userID, records, res, callback, true);
//	// }
//};
//
//exports.addRecords = addOrUpdateReminderRecord;
