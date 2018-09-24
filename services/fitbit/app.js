var express = require('express');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var async = require('async');
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;

var partials = require('express-partials');
var http = require('http');
var path = require('path');
var cron = require('node-schedule');



//Mongo
//Mongoose db
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
//Importing exercise.js Mongo model
var User = require('./models/exercise');
//Schema for all Fitbit Users
var UserFitbit = require('./models/fitbit');




//Fitbit API for calls
var FitbitApiClient = require("fitbit-node"),
    client = new FitbitApiClient("227MB3", "eaf40e7ba413495eac6fe772ad659f6b");

var calObj, stepObj;
var FITBIT_CLIENT_ID = "227MB3";
var FITBIT_CLIENT_SECRET = "eaf40e7ba413495eac6fe772ad659f6b";
var access_token;
var refresh_token;
var userEncodedID;




passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


passport.use(new FitbitStrategy({
        clientID: FITBIT_CLIENT_ID,
        clientSecret: FITBIT_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/fitbit/callback"
    },
    function(token, tokenSecret, profile, cb) {
        // asynchronous verification, for effect...

        access_token = token;
        refresh_token = tokenSecret;
        var fitbitUser = new UserFitbit();
        //TODO Need to save USerID
        console.log("#### Printing PROFILE" + JSON.stringify(profile));
        fitbitUser.userID = profile.id;
        fitbitUser.accessToken = token;
        fitbitUser.refreshToken = tokenSecret;
        fitbitUser.save();
        console.log("Saved User's fitbit data: "+ fitbitUser);
        saveLastMonthData();
        process.nextTick(function () {

            return cb(null, profile);
        });
    }
));


//mongoose.set('debug', true);

var app = express();

// configure Express

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 3000);



app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

app.get('/fitbit/login', function(req, res){
    res.render('login', { user: req.user });
});

app.get('/auth/fitbit',
    passport.authenticate('fitbit', { scope: ['activity','heartrate','location','profile']}),
    function(req, res){

    });


app.get('/auth/fitbit/callback',
    passport.authenticate('fitbit', {

        successRedirect: '/',
        failureRedirect: '/login' }),
    function(req, res) {
        saveLastMonthData();
    });



// res.redirect('/');


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});



function refreshAllUserTokens(){


    UserFitbit.find({}, function(err, users) {
        if (err) throw err;

        for (var i in users){
            client.refreshAccesstoken(users[i].accessToken, users[i].refreshToken)
                .then(function(new_token) {
                    users[i].accessToken = new_token.access_token;
                    users[i].refreshToken = new_token.refreshToken;
                }).catch(function(err){
                console.log('error refreshing user token: ' + err);
            });
            users[i].save();

        }
    });
}


function insertYesterdayData(){
    UserFitbit.find({}, function(err, users) {

        if (err) throw err;
        //console.log("#### Inserting Yesterday Data to all users: "+ users);
        for (var y in users){
            async.waterfall([
                function(callback){
                    client.get("/activities/calories/date/today/7d.json", users[y].accessToken).then(function (results) {
                        calObj = results[0]['activities-calories'][5];
                        console.log("Calories! at "+ y +" "+JSON.stringify(results[0]['activities-calories'][5]));
                        callback(null);
                    });//closing get client for Calories
                },
                function(callback){
                    client.get("/activities/steps/date/today/7d.json", users[y].accessToken).then(function (results) {
                        stepObj = results[0]['activities-steps'][5];
                        console.log("Steps! at "+ y +" "+JSON.stringify(results[0]['activities-steps'][5]));
                        callback(null);
                    });//closing get client for Calories
                },
                function(callback){
                    var new_user = new User();
                    new_user.userID = users[y].userID;
                    new_user.calories = calObj.value;
                    new_user.recordedTime = calObj.dateTime;
                    new_user.exerciseRecordType = 2; //2 for fitbit
                    new_user.stepCount = stepObj.value;
                    new_user.save(function(err){
                        if(err)
                            throw err;
                        callback(null);
                    });
                }]);
        }
    });
}


function saveLastMonthData(){
    console.log("#### Executing express callback");
    async.waterfall([
        //Saving UserID
        function(callback) {

            // res.redirect('/');
            console.log("#### Geting User Data");
            client.get("/profile.json", access_token).then(function (results) {
                //Saving Fitbit UserID for later [to be saved]
                userEncodedID = results[0]['user']['encodedId'];
                callback(null);
            })
        },
        //Get last month's data
        function(callback) {
            client.get("/activities/calories/date/today/30d.json", access_token).then(function (results) {
               // console.log("printing last month calories: "+JSON.stringify(results)); - OK
                callback(null, results[0]['activities-calories']);
            });
        },
        //Save last month's data
        function(monthCalories, callback) {
            console.log("#### Saving last month's Data");

            //Save stepCount up until yesterday
            client.get("/activities/steps/date/today/30d.json", access_token).then(function (results) {
                var calorieArray = Array.prototype.slice.call(monthCalories);
                var stepArray = Array.prototype.slice.call(results[0]['activities-steps']);
               console.log("#### Printing stepArray"+stepArray);
                for (var i in calorieArray ) {// -1 to save until yesterday
                    console.log("At index: "+ i);
                    var new_user = new User();
                    new_user.userID = userEncodedID;
                    new_user.calories = calorieArray[i].value;
                    new_user.recordedTime = calorieArray[i].dateTime;
                    new_user.exerciseRecordType = 2; //2 for fitbit

                    new_user.stepCount = stepArray[i].value;
                    //Saving user
                    new_user.save(function(err){
                        if(err)
                            throw err;
                    });

                if (i == (calorieArray.length - 2))
                    callback(null);


                }
            });//closing GET Calories




        },
        //Confirming - printing all users
        function() {
            User.find({}, function(err, users){
                console.log("Printing users with new Month data: \n"+users);
            });
            if (err) return res.status(500).send(err);
            //res.status(200).redirect('/');
        }]);
}



/* run operation everyday at 2:30AM*/
cron.scheduleJob(" 30 2 * * *", function(){
    console.log("Updating DB every 2:30AM");
    //Async call for refreshing each FitBit User's tokens & inserting yesterday's data
    async.waterfall([
        function(callback){
            refreshAllUserTokens();
            callback();
        },
        function(callback){
            insertYesterdayData();
            callback();
        }
    ])

});



function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}





module.exports = app;