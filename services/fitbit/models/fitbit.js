/**
 * Created by fadi on 8/6/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FitbitApiClient = require("fitbit-node"),
    client = new FitbitApiClient("227MB3", "eaf40e7ba413495eac6fe772ad659f6b");

var FitbitSchema = new Schema({
    userID: {
        type: String,
        required: 'userID cannot be blank'
    },
    accessToken: String,
    refreshToken: String


});


// custom method to add string to end of name
// you can create more important methods like name validations or formatting
// you can also do queries and find similar users
FitbitSchema.methods.refresh = function() {
    // add some stuff to the users name

    client.refreshAccesstoken(this.accessToken, this.refreshToken)
        .then(function(new_token) {
            console.log("## Old access token: "+ this.accessToken);
            this.accessToken = new_token.access_token;
            this.refreshToken = new_token.refreshToken;
            //Need to Save to User MongoDB
            console.log("## New access token: "+ this.accessToken);
        }).catch(function(err){
        console.log('error refreshing user token: ' + err);
    });




};



module.exports = mongoose.model('Fitbit', FitbitSchema);