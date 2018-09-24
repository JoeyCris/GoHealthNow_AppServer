'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KnowledgeSchema = new Schema({
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
  contenu: {
		type: String,
		default: ''
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
    enum: ['new','tip','other','report'],
    required: 'Type cannot be empty'
  },
  create_time: {
    type: Date,
    default: Date.now,
    required: 'date cannot be empty'

  },
  send_push: {
    type: Boolean,
    default: false
  },
  send_email: {
    type: Boolean,
    default: false
  },
  priority:{
    type: Number,
    default: 3,
  },
  replace_parts: [{
    keyword: String,
    reference : String
  }]
});

mongoose.model('Knowledge', KnowledgeSchema);
