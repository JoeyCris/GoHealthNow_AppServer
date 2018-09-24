var app = require('../server.js');
var request = require('supertest');
var should = require('should');
var bodyparser = require("body-parser");

describe('Google cloud messaging API', function() {

  it('case 1: Input{null}', function(done) {
    request(app)
    .post('/pushserver/gcm/')
    .send({regid: null, apikey: null, mes: null})
    .expect('Bad request', done);
    done();
  });

  it('case 2: Input{undefined}', function(done) {
    request(app)
    .post('/pushserver/gcm/')
    .send({regid: undefined, apikey: undefined, mes: undefined})
    .expect('Bad request', done);
    done();
  });

  it('case 3: Input{Registration ID, API Key, Message}', function(done) {
    request(app)
    .post('/pushserver/gcm/')
    .send({regid: "APA91bFjrvG4Wp0kaoXESYgrj2VKsstKqLlmf3lZXV5pnxMvO789jJdElkBdkkqvLdjWINQ7nYDVTwUWUIZc_rokfKkLodc8Ek9HT77XKMg5t1xOmbDTrRryH8Obdkx3x_Tp71w2We4ic3T-Mxgmnzx9CK53VnFH46m8Nrc6NjT4ruQgekd-XAY", apikey: "AIzaSyAJyf3XERplbpIzqaxl7y2c-Gx028y24xI", mes: "API test"})
    .expect('Notification delivered', done);
    done();
  });

});

describe('Apple push notification API', function() {

  it('case 1: Input {null}', function(done) {
    request(app)
    .post('/pushserver/apn/')
    .send({token: null, mes: null})
    .expect('Bad request', done);
    done();
  });

  it('case 2: Input {undefined}', function(done) {
    request(app)
    .post('/pushserver/apn/')
    .send({token: undefined, mes: undefined})
    .expect('Bad request', done);
    done();
  });

  it('case 3: Input {Token, Message}', function(done) {
    request(app)
    .post('/pushserver/apn/')
    .send({token: 'test', mes: 'test'})
    .expect(200)
    .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.status.should.equal(200);
        });
    done();
  });

});
