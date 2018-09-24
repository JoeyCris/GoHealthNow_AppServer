/**
 * Created by carltonwang on 2016-02-27.
 */

require('../entryPoint/app/models/user.server.model.js');
require('./models/userstat.js');

var mongoose = require('mongoose');
source = mongoose.createConnection('mongodb://localhost:27017/rawdata');
target = mongoose.createConnection('mongodb://localhost:27017/ripedata');

User = source.model('User');
User.find(function(err, users){
    if (err) throw err;
    UserStat = target.model('UserStat');
    users.forEach(function(user){
        var userstat = new UserStat({
            user: user._id,
            name: null,
            isAccessCodeSet: null,
            isBarcodeScanUsed: null,
            isFoodRecognitionUsed: null,
            profileUpdateFrequency: null,
            profileUpdateWeeklyFrequency: null,
            profileUpdateMonthlyFrequency: null,
            bloodGlucoseRecordFrequency: null,
            bloodGlucoseRecordWeeklyFrequency: null,
            bloodGlucoseRecordMonthlyFrequency: null,
            bloodGlucoseAverage: null,
            bloodGlucoseWeeklyAverage: null,
            bloodGlucoseMonthlyAverage: null,
            lowBloodGlucoseFrequency: null,
            lowBloodGlucoseWeeklyFrequency: null,
            lowBloodGlucoseMonthlyFrequency: null,
            highBloodGlucoseFrequency: null,
            highBloodGlucoseWeeklyFrequency: null,
            highBloodGlucoseMonthlyFrequency: null,
            dietRecordFrequency: null,
            dietRecordWeeklyFrequency: null,
            dietRecordMonthlyFrequency: null,
            unhealthyDrinkFrequency: null,
            unhealthyDrinkWeeklyFrequency: null,
            unhealthyDrinkMonthlyFrequency: null,
            unhealthyFoodFrequency: null,
            unhealthyFoodWeeklyFrequency: null,
            unhealthyFoodMonthlyFrequency: null,
            exerciseRecordFrequency: null,
            exerciseRecordWeeklyFrequency: null,
            exerciseRecordMonthlyFrequency: null
        });
        userstat.save(function(err){
            if (err) throw err;
        });
    });
});

console.log('UserStat has been created!');