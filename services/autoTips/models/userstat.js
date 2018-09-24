/**
 * Created by carltonwang on 2016-03-01.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserStatSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    name: {
        type: String
    },
    isAccessCodeSet: {
        type: Boolean
    },
    isBarcodeScanUsed: {
        type: Boolean
    },
    isFoodRecognitionUsed: {
        type: Boolean
    },
    profileUpdateFrequency: {
        type: Number
    },
    profileUpdateWeeklyFrequency: {
        type: Number
    },
    profileUpdateMonthlyFrequency: {
        type: Number
    },
    bloodGlucoseRecordFrequency: {
        type: Number
    },
    bloodGlucoseRecordWeeklyFrequency: {
        type: Number
    },
    bloodGlucoseRecordMonthlyFrequency: {
        type: Number
    },
    bloodGlucoseAverage: {
        type: Number
    },
    bloodGlucoseWeeklyAverage: {
        type: Number
    },
    bloodGlucoseMonthlyAverage: {
        type: Number
    },
    lowBloodGlucoseFrequency: {
        type: Number
    },
    lowBloodGlucoseWeeklyFrequency: {
        type: Number
    },
    lowBloodGlucoseMonthlyFrequency: {
        type: Number
    },
    highBloodGlucoseFrequency: {
        type: Number
    },
    highBloodGlucoseWeeklyFrequency: {
        type: Number
    },
    highBloodGlucoseMonthlyFrequency: {
        type: Number
    },
    dietRecordFrequency: {
        type: Number
    },
    dietRecordWeeklyFrequency: {
        type: Number
    },
    dietRecordMonthlyFrequency: {
        type: Number
    },
    unhealthyDrinkFrequency: {
        type: Number
    },
    unhealthyDrinkWeeklyFrequency: {
        type: Number
    },
    unhealthyDrinkMonthlyFrequency: {
        type: Number
    },
    unhealthyFoodFrequency: {
        type: Number
    },
    unhealthyFoodWeeklyFrequency: {
        type: Number
    },
    unhealthyFoodMonthlyFrequency: {
        type: Number
    },
    exerciseRecordFrequency: {
        type: Number
    },
    exerciseRecordWeeklyFrequency: {
        type: Number
    },
    exerciseRecordMonthlyFrequency: {
        type: Number
    }
});

mongoose.model('UserStat', UserStatSchema);