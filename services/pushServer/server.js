var mongoose = require('mongoose');
process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');

var gcm = require('node-gcm');
var apn = require('apn');
var express = require("express");
var bodyparser = require("body-parser");
var devconfig = require("./lib/devconfig");
var prodconfig = require("./lib/prodconfig");

require('./models/message');
var GCMPushMessage = mongoose.model('GCMPushMessage');
var APNPushMessage = mongoose.model('APNPushMessage');

process.chdir(__dirname);

var app  = express();

// body parser middleware
app.use(bodyparser.urlencoded({ extended: true }));



app.post('/pushserver/gcm/', function(req, res){



  if(req.body.regid != 'null' && req.body.regid != 'undefined' && req.body.regid != 'false' && req.body.regid != ""   &&
     req.body.apikey != 'null' && req.body.apikey != 'undefined' && req.body.apikey != 'false' && req.body.apikey != ""  &&
     req.body.mes != 'null' && req.body.mes != 'false' && req.body.mes != 'undefined' && req.body.mes != "" ){

        var registrationIds = [];

        //Registration ID
        var regid = req.body.regid;
        // Google cloud console api key
        var apikey = req.body.apikey;
        var sender = new gcm.Sender(apikey);

        var message = new gcm.Message({
            collapseKey: 'demo',
            delayWhileIdle: true,
            timeToLive: 3,
            data: {
                // Message to be passed to the GCM
                message: req.body.mes
            }
        });

        //List of registration ID's
        registrationIds.push(regid);

        // Send notification
        sender.sendNoRetry(message, registrationIds, function(err, result) {
            if(err){
                console.error("pushserver gcm error: " +err);
                res.status(500).send("Notification not delivered");
            }else{
                console.info("pushserver gcm: Notification delivered");
                res.status(200).send("Notification delivered");
            }
        });

  }else{

    // Bad request, when no regid, apikey and message
    console.info("pushserver gcm: Bad request")
    res.status(400).send("Bad request");
  }


});

app.post('/pushserver/apn/', function(req,res){


    // Notify only when the request has both token and message
    if(req.body.token != 'null' && req.body.token != 'false'  && req.body.token != 'undefined'  && req.body.token != "" &&
       req.body.mes != 'null' && req.body.mes != 'false' && req.body.mes != 'undefined' &&  req.body.mes != ""){

          var token = req.body.token;
          var appid = req.body.appid;

          //appid ==1 for Gohealthnow
          if(appid==1){
              if(process.env.NODE_ENV == 'production'){
                 // option for production server
                options = {
                   // key : prodconfig.key,
                   // cert : prodconfig.cert,
                   // passphrase: prodconfig.passphrase
                    key: "./certificates/production/GHN_APNS_PKey_Prod.pem",
                    cert: "./certificates/production/GHN_APNS_Certificates_Prod.pem",
                    passphrase: devconfig.dev_passphrase
                };
                console.info("GHN pushserver apn env:" +process.env.NODE_ENV);
                console.info("GHN pushserver apn config options:  ", +JSON.stringify(options));
              }else{
                // options for development server
                options = {
                    key : devconfig.ghn_key,
                    cert : devconfig.ghn_cert,
                    production: false,
                    passphrase: devconfig.dev_passphrase
                };
                console.info("GHN pushserver apn env: " +process.env.NODE_ENV);
                console.info("GHN pushserver apn config options: " +JSON.stringify(options));
              }
          }
          //appid:0 for Glucoguide
          else{
              if(process.env.NODE_ENV == 'production'){
                 // option for production server
                options = {
                   // key : prodconfig.key,
                   // cert : prodconfig.cert,
                   // passphrase: prodconfig.passphrase
                    key: "./certificates/production/GGProdKey.pem",
                    cert: "./certificates/production/GGProdCert.pem",
                    passphrase: "K^6^#$j6T9u8"
                };
                console.info("GG pushserver apn env:" +process.env.NODE_ENV);
                console.info("GG pushserver apn config options:  ", +JSON.stringify(options));
              }else{
                // options for development server
                options = {
                    key : devconfig.key,
                    cert : devconfig.cert,
                    production: false,
                    passphrase: devconfig.dev_passphrase
                };
                console.info("GG pushserver apn env: " +process.env.NODE_ENV);
                console.info("GG pushserver apn config options: " +JSON.stringify(options));
              }
          }
          
          var apnConnection = new apn.Connection(options);
          var myDevice = new apn.Device(token);
          var note = new apn.Notification();

          note.expiry = Math.floor(Date.now() / 1000) + 3600;
          note.badge = 1;
          note.alert = req.body.mes;

          apnConnection.pushNotification(note, myDevice);

          // Notification delivered to apn
          apnConnection.on("transmitted", function(notification, device){
            console.info("Notification transmitted to apn service")
          });

          // Emitted after notification is being delivered
          apnConnection.on("completed", function(){
              console.info("pushserver apn: Notification delivered");
              res.status(200).send("Notification delivered");
          });

          // connection error
          apnConnection.on("error", function(err){
              console.error("pushserver apn error: " +err);
              res.status(500).send("Transmission error : " + err);
          });

    }else{

      // Bad request, when no token and body
      console.info("pushserver apn: Bad request")
      res.status(400).send("Bad request");
    }

});

app.post('/pushserver/gcm/delayed', function(req, res){
  if(req.body.regid != 'null' && req.body.regid != 'undefined' && req.body.regid != 'false' && req.body.regid != ""   &&
     req.body.apikey != 'null' && req.body.apikey != 'undefined' && req.body.apikey != 'false' && req.body.apikey != ""  &&
     req.body.mes != 'null' && req.body.mes != 'false' && req.body.mes != 'undefined' && req.body.mes != "" ){
        console.log(req.body);
        var message = new GCMPushMessage(req.body);
        message.save(function(err){
          if(err){
            console.error("pushserver gcm error: " +err);
            res.status(500).send("Notification not delivered");
          }else{
            console.info("pushserver gcm: Notification delivered");
            res.status(200).send("Notification delivered");
          }
        });
  }else{
    // Bad request, when no regid, apikey and message
    console.info("pushserver gcm: Bad request")
    res.status(400).send("Bad request");
  }
});

app.post('/pushserver/apn/delayed', function(req,res){


    // Notify only when the request has both token and message
    if(req.body.token != 'null' && req.body.token != 'false'  && req.body.token != 'undefined'  && req.body.token != "" &&
       req.body.mes != 'null' && req.body.mes != 'false' && req.body.mes != 'undefined' &&  req.body.mes != ""){
         console.log(req.body);
        //  console.log(req);
         var message = new APNPushMessage(req.body);
         message.save(function(err){
           if(err){
             console.error("pushserver apn error: " +err);
             res.status(500).send("Transmission error : " + err);
           }else{
             console.info("pushserver apn: Notification delivered");
             res.status(200).send("Notification delivered");
           }
         });
    }else{
      // Bad request, when no token and body
      console.info("pushserver apn: Bad request")
      res.status(400).send("Bad request");
    }

});

// Error handling middleware
app.use(function(err, req, res, next) {

  if(err.status == 500){
    res.status(500).send('Internal server error');
  }
  if(err.status == 404){
    res.status(404).send('Not found');
  }

});

// Port setup
var port = process.argv[2] || 30000;

// Server setup
var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;
    console.info("pushserver host: " +host);
    console.info("pushserver port: " +port);

});

module.exports = app;
