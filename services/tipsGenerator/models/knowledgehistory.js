'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KnowledgeHistorySchema = new Schema({
    user: {
  		type: Schema.ObjectId,
  		ref: 'User',
      required: 'User cannot be blank'
  	}, //userID
    history: [{
      knowledgeId: {
        type: Schema.ObjectId,
        ref: 'Knowledge'
      },
      adopt_times : Number
    }] //userID//topicID
});

mongoose.model('KnowledgeHistory', KnowledgeHistorySchema);
