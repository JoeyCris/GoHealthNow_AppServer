'use strict';

/**
 * Created by robertwang on 15-04-10.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GCMPushMessageSchema = new Schema({
    regid : String,
    apikey : String,
    mes: String,
    send_time : Date,
    sended : {
      type: Boolean,
      default: false
    }
});

mongoose.model('GCMPushMessage', GCMPushMessageSchema);

var APNPushMessageSchema = new Schema({
  token: String,
  mes: String,
  send_time : Date,
  sended : {
    type: Boolean,
    default: false
  }
});

mongoose.model('APNPushMessage', APNPushMessageSchema);
