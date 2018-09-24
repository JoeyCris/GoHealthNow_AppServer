'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KnowledgeScoreSchema = new Schema({
    user: {
  		type: Schema.ObjectId,
  		ref: 'User',
      required: 'User cannot be blank'
  	}, //userID
    score: [{
      knowledgeId: {
        type: Schema.ObjectId,
        ref: 'Knowledge'
      },
      score : Number
    }] //userID//topicID
});

mongoose.model('KnowledgeScore', KnowledgeScoreSchema);
