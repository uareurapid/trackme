/**
 * Created by paulocristo on 25/10/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrackableSchema = new Schema({
    //id: ObjectId,
    name: String,
    description: String,
    owner: String,
    creationDate: String,
    //type: String //'person','animal','object',
    type: {
        validator: function(v) {
            return v==='animal' || v==='animal' || v==='object';
        },
        message: '{VALUE} is not a valid trackable type!'
    }
});

module.exports = mongoose.model('Trackable', TrackableSchema);


