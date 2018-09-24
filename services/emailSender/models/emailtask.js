'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EmailSchema = new Schema({
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  // medias:[ {
  //   uri: String,
  //   mimeType: {
  //       type: String,
  //       enum: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp']  //0: image/jpg
  //   }
  // }],
  // link: String,
  status: {
    type: String,
    enum: ['new','processing','ongoing','finished','error'],
    default: 'new',
    required: 'Type cannot be empty'
  },
  create_time: {
    type: Date,
    default: Date.now,
    required: 'date cannot be empty'
  },
  sended:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  unsend:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  progress:{
    type: Number,
    default: 0
  },
  total:{
    type:Number,
    default: 0
  },
  finish_time:{
    type: Date
  },
  interupt_time:{
    type: Date
  }
});

mongoose.model('Email', EmailSchema);
