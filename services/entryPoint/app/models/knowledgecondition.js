'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KnowledgeConditionSchema = new Schema({
  knowledgeId: {
    type: Schema.ObjectId,
    ref: 'Knowledge'
  }, //userID
  conditions: [{
      type: Schema.ObjectId,
      ref: 'ConditionFunction'
  }]
});

mongoose.model('KnowledgeCondition', KnowledgeConditionSchema);
