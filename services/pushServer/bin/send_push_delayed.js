var mongoose = require('mongoose');

process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
var async = require('async');
var gcm = require('node-gcm');
var apn = require('apn');
var devconfig = require("../lib/devconfig");
var prodconfig = require("../lib/prodconfig");

require('../models/message');
var GCMPushMessage = mongoose.model('GCMPushMessage');
var APNPushMessage = mongoose.model('APNPushMessage');


var send_gcm_message = function(done){
  APNPushMessage.aggregate([{"$match":{"sended":false}},{"$group":{"_id":"$regid"}}]).exec(function(err,results){
    async.each(results, function(element, callback){
      GCMPushMessage.findOne({send_time:{'$lte':new Date()}, sended: false},function(err, message){
        if(err){
          console.error('Cannot find proper GCM push message.');
          callback(err);
        }else if(message){
              var registrationIds = [];

              //Registration ID
              var regid = message.regid;
              // Google cloud console api key
              var apikey = message.apikey;
              var sender = new gcm.Sender(apikey);

              var message = new gcm.Message({
                  collapseKey: 'demo',
                  delayWhileIdle: true,
                  timeToLive: 3,
                  data: {
                      // Message to be passed to the GCM
                      message: message.mes
                  }
              });

              //List of registration ID's
              registrationIds.push(regid);

              // Send notification
              sender.sendNoRetry(message, registrationIds, function(err, result) {
                  if(err){
                      console.error("pushserver gcm error: " +err);
                      callback(err);
                  }else{
                      console.info("pushserver gcm: Notification delivered");
                      message.sended = true;
                      message.save(function(err){
                        if(err){
                          console.error("Update message error: "+ err);
                          callback(err);
                        }else{
                          callback();
                        }
                      });
                  }
              });

        }else{

          console.info('Cannot find proper GCM push message.');
          callback();
        }
      });
    },function(err){
      if (err) {
        console.log('A push notifiction failed to process');
      } else {
        console.log('All push notifictions have been processed successfully');
      }
    });
  });
};

var send_apn_message =  function(done){
  APNPushMessage.aggregate([{"$match":{"sended":false}},{"$group":{"_id":"$token"}}]).exec(function(err,results){
    async.each(results,function(element,callback){
      APNPushMessage.findOne({token: element._id, send_time:{'$lte':new Date()}, sended: false},function(err, message){
        if(err){
          console.error('Cannot find proper APN push message.');
          callback(err);
        }else if(message){
            // Notify only when the request has both token and message
              var token = message.token;
              // var token = "789c22c7c765b1177b7386d169ba7362b940c10ea6754882c685e9dda528d6f7";

              if(process.env.NODE_ENV == 'production'){
                 // option for production server
                options = {
                   // key : prodconfig.key,
                   // cert : prodconfig.cert,
                   // passphrase: prodconfig.passphrase
                    key: "../certificates/production/GGProdKey.pem",
                    cert: "../certificates/production/GGProdCert.pem",
                    passphrase: "K^6^#$j6T9u8"
                };
                console.info("pushserver apn env:" +process.env.NODE_ENV);
                console.info("pushserver apn config options:  ", +JSON.stringify(options));
              }else{
                // options for development server
                options = {
                    production: false,
                    // key : devconfig.key,
                    // cert : devconfig.cert,
                    // passphrase: devconfig.passphrase
                    key: "../certificates/development/GlucoGuideKey.pem",
                    cert: "../certificates/development/GlucoGuideCert.pem",
                    passphrase: "glucoguide"

                };
                console.info("pushserver apn env: " +process.env.NODE_ENV);
                console.info("pushserver apn config options: " +JSON.stringify(options));
              }

              var apnConnection = new apn.Connection(options);
              var myDevice = new apn.Device(token);
              var note = new apn.Notification();

              note.expiry = Math.floor(Date.now() / 1000) + 3600;
              note.badge = 1;
              note.alert = message.mes;

              apnConnection.pushNotification(note, myDevice);

              // Notification delivered to apn
              apnConnection.on("transmitted", function(notification, device){
                console.info("Notification transmitted to apn service")
              });

              // Emitted after notification is being delivered
              apnConnection.on("completed", function(){
                  console.info("pushserver apn: Notification delivered");
                  message.sended = true;
                  message.save(function(err){
                    if(err){
                      console.error("Update message error: "+ err);
                      callback(err);
                    }else{
                      callback();
                    }
                  });
              });

              // connection error
              apnConnection.on("error", function(err){
                  console.error("pushserver apn error: " +err);
                  callback(err);
              });

        }else{

          console.info('Cannot find proper APN push message.');
          callback();

        }
      });
    },function(err){
      if (err) {
        console.log('A push notifiction failed to process');
      } else {
        console.log('All push notifictions have been processed successfully');
      }
    });
  });

};

send_gcm_message();
send_apn_message();
