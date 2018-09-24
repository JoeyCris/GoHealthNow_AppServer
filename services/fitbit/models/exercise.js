/**
 * Created by robertwang on 2016-06-20.
 */
'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var ExerciseSchema = new Schema({
    userID: {
        type: String,
        required: 'userID cannot be blank'
    },
    uuid: String,
    exerciseRecordType: Number, //0 from manual input, 1 from pedometer
    exerciseStartingTime: Date, //Starting time
    stepCount: Number,
    minutes: Number,
    type: {
        type: String,
        enum: ['Light', 'Moderate', 'Vigorous']
    },
    interval: Number,
    calories: Number,
    note: String,
    recordedTime: Date

});



module.exports = mongoose.model('Exercise', ExerciseSchema);