/**
 * Created by Canon on 2016-03-31.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DietNoteSchema = new Schema({
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

	reference:  {
		type: Schema.ObjectId,
	} //userID//topicID

});

mongoose.model('Dietnote', DietNoteSchema);
