'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TopicSchema = new Schema({
    user: {
  		type: Schema.ObjectId,
  		ref: 'User',
      required: 'User cannot be blank'
  	}, //userID
    creator: {
  		type: Schema.ObjectId,
  		ref: 'User',
      required: 'Creator cannot be blank'
  	}, //userID
    signature: {
      type: String,
      required: 'Signature cannot be blank'
    },
    description: {
      type: String,
      required: 'Description cannot be blank'
    },
    type: {
        type: String,
        enum: ['message','tip','answer','reminder','announcement','instruction', 'report'], //0:  message, 1: tip, 2: answer
        required: 'Type cannot be blank'
    },
    create_time: {
      type: Date,
      default: Date.now
    },
    update_time: {
      type: Date,
      default: Date.now
    },
    medias:[ {
        uri: String,
        mimeType: {
            type: String,
            enum: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp']  //0: image/jpg
        }
    }],
    link: String,
    comments: [{
        user: {
      		type: Schema.ObjectId,
      		ref: 'User'
      	},
        content: String
    }],
    likes: [ {
  		type: Schema.ObjectId,
  		ref: 'User'
  	} ], //userID
    dislikes: [ {
  		type: Schema.ObjectId,
  		ref: 'User'
  	}], //userID

    reference:  {
  		type: Schema.ObjectId,
  	}, //userID//topicID
    referenceType: {
      type: String,
      enum: ['Question','Meal']
    }
});

mongoose.model('Topic', TopicSchema);
