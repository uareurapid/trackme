/**
 * Created by paulocristo on 25/10/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    id: ObjectId,
    deviceId: String,
    deviceDescription: String,
    deviceOwner: String
});

module.exports = mongoose.model('Device', DeviceSchema);

