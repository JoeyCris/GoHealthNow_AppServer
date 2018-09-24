'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SummarySchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'User cannot be blank'
  }, //userID
  title: {
    type: String,
    default: '',
    required: 'Title cannot be empty'
  },
  content: {
		type: String,
		default: '',
    required: 'Content cannot be empty'
	},
  medias:[ {
    uri: String,
    mimeType: {
        type: String,
        enum: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp']  //0: image/jpg
    }
  }],
  link: String,
  type: {
    type: String,
    enum: ['daily','weekly','monthly'],
    required: 'Type cannot be empty'
  },
  create_time: {
    type: Date,
    default: Date.now,
    required: 'date cannot be empty'

  },
  send_push: {
    type: Boolean,
    default: true
  },
  send_email: {
    type: Boolean,
    default: true
  },
  points:{
    type: Number,
    default: 0,
  },
});

mongoose.model('Summary', SummarySchema);
