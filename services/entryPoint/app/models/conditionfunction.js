'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConditionFunctionSchema = new Schema({
    functionURL : String,
    functionName : String,
    functionType: String,
    returnValue : Boolean
});

mongoose.model('ConditionFunction', ConditionFunctionSchema);
