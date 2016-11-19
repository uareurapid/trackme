/**
 * Created by paulocristo on 10/11/15.
 */

//API ROUTES
module.exports = function(apiRouter) {

//TODO authenticate API REQUESTS
//https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

    //================== trackables ======================

    var Trackable  = require('../models/trackable');
    // get all trackables
    apiRouter.get('/trackables', function(req, res) {

        var expression = null;

        //***** get the query params ********
        var url = require('url');
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        //***********************************

        if(req.owner) {

            console.log("filter trackables by owner: " + req.owner);

            if(query.trackable_id) {
                expression = {
                    owner : req.owner,
                    _id : query.trackable_id

                };
                console.log("also filter by id: " + query.trackable_id);
            }
            else {
                expression = {
                    owner : req.owner
                };
            }

        }

        if(expression!=null) {
            var query = Trackable.find(expression);
            query.exec(function (err, trackables) {
                if (err)
                    res.send(err)

                res.send(trackables);
            });
        }
        else {
            //TODO NOT POSSIBLE!!!!
            // use mongoose to get all records in the database
            //Trackable.find(function(err, trackables) {

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            //    if (err)
            //        res.send(err)

            //    res.json(trackables); // return all trackables in JSON format
            //});
            res.json(400,{err: "Bad request!"});
        }

    });

    // create trackables and send back all todos after creation
    apiRouter.post('/trackables', function(req, res) {

        //only used if privacy protected
        var protectedCode = "";
        if(req.body.privacy=="Protected") {
            var ProfileController = require('../controllers/profile.js');
            protectedCode = ProfileController.generateUUID();
        }

        console.log("received: " + JSON.stringify(req.body));

        if(!req.body.owner) {
            console.log("trackable owner is missing...");
            res.json(400, {err: 'Bad request!'});
        }
        //Return the number of milliseconds since 1970/01/01:
        var timeOfCreation = new Date().getTime();
        // create a device, information comes from AJAX request from Angular
        Trackable.create({

            name: req.body.name,
            description: req.body.description,
            owner: req.body.owner,
            creationDate: timeOfCreation,
            privacy: req.body.privacy,
            type: req.body.type,
            unlockCode: protectedCode,
            done : false
        }, function(err, trackable) {
            if (err)
            {
                console.log("unable to create trackable: " + err);
                res.send(err);
            }
            else {
                console.log("trackable created successfully");
                //send the trackable json
                res.json(trackable);
            }

        });

    });

    // delete a trackable
    apiRouter.delete('/trackables/:trackable_id', function(req, res) {
        Trackable.remove({
            _id : req.params.trackable_id
        }, function(err, trackable) {
            if (err)
                res.send(err);

            // get and return all the trackables after you create another
            Trackable.find(function(err, trackables) {
                if (err)
                    res.send(err)
                res.json(trackables);
            });
        });
    });

    //get details
    apiRouter.get('/trackables/:trackable_id', function(req, res) {

            // get and return all the trackables after you create another
            Trackable.find(
                //filter expression
                {_id : req.params.trackable_id},function(err, trackable) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.json(trackable);
                }

            });
    });

    //get details
    /*apiRouter.get('/trackable_info', function(req, res) {

        console.log("PROTECTED ROUTE CALLED");
        //***** get the query params ********
        var url = require('url');
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        //***********************************
        if(query.unlock_code) {
            console.log("UNLOCK CODE: " + query.unlock_code);

            Trackable.find(
                //filter expression
                {unlockCode : query.unlock_code}

                ,function(err, trackable) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.json(trackable);
                    }

                });
        }
        else {
            res.json(403, {err: 'Unauthorized!'});
        }

    });*/

    //TODO protect the class, must be issued by same user email
    // delete all trackables
    apiRouter.delete('/trackables/delete/all/:owner_id', function(req, res) {
        console.log("try to remove all of + " + req.params.owner_id);
        Trackable.remove({
            owner : req.params.owner_id
        }, function(err, trackable) {
            if (err) {
                res.send(err);
            }
            else {
                res.json(200, {msg: 'Successfully removed trackables!'});
            }

            // get and return all the trackables after you create another
            //Trackable.find(function(err, trackables) {
            //    if (err)
            //        res.send(err)
            //    res.json(trackables);
            //});
        });
    });

    //---------------------------------------------------------------------
    // Email API
    apiRouter.get('/sendmail', function(req,res) {

        var MailerService = require('../controllers/mail.js');
        MailerService.sendEmail(req,res, function(response) {
            console.log("my callback response: " + response);
        });
    });

    //-----------------------------------------------------------------------
    //===============Records=============
    var Record  = require('../models/record');
    // get all records
    apiRouter.get('/records', function(req, res) {

        var expression = null;
        if(req.query.device_id) {

            console.log("filter records by device_id: " + req.query.device_id);
            //query with mongoose, we need to explicitly remove the _d field with a - sign,
            //since it´s always included by default
            expression = {
                deviceId : req.query.device_id
            };
        }
        else if(req.query.trackable_id) {
            console.log("filter records by trackable_id: " + req.query.trackable_id);
            expression = {
                trackableId : req.query.trackable_id
            };
        }

        //do we have a filtering option?
        if(expression!==null) {

            var query = Record.find(expression).sort( [['time', 1]] );// get all items asc by created date;
            query.exec(function (err, records) {
                if (err)
                    res.send(err)

                res.send(records);
            });
        }
        else {
            //just use mongoose to get all records in the database
            Record.find(function(err, records) {

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)

                res.json(records); // return all records in JSON format
            }).sort( [['time', 1]] );// get all items asc by created date.;
        }

    });

    //latitude=39.6463779&longitude=-8.8170089&trackableId=563e26b780ff708e0b8cbe9c&deviceId=undefined
    // create device and send back all todos after creation
    apiRouter.post('/records', function(req, res) {

        //these are optional params
        var recName = req.body.name || 'no_name';
        var recDescription = req.body.description || 'no_description';

        //Return the number of milliseconds since 1970/01/01:
        var timeOfRecord = new Date().getTime();
        // create a record, information comes from AJAX request from Angular
        Record.create({

            name: recName,
            description: recDescription,
            latitude: req.body.latitude,
            longitude : req.body.longitude,
            time: timeOfRecord,
            trackableId: req.body.trackableId,
            deviceId: req.body.deviceId,
            done: false
        }, function(err, record) {
            if (err) {
                res.send(err);
            }
            else {
                //send the record back
                res.json(record);
            }

            // get and return all the records after you create another
            //Record.find(function(err, records) {
            //    if (err) {
            //        console.log("error adding record: " + err);
            //        res.send(err);
            //    }
            //    res.json(records);
            //});
        });

    });

    // delete a record
    apiRouter.delete('/records/:record_id', function(req, res) {
        Record.remove({
            _id : req.params.record_id
        }, function(err, record) {
            if (err)
                res.send(err);

            // get and return all the records after you create another
            Record.find(function(err, records) {
                if (err)
                    res.send(err)
                res.json(records);
            });
        });
    });

    //for admin ONLY TODO put separated place
    var deleteAllRecords = function() {
        console.log("try remove all records from DB: ");
        Record.remove({}, function(err, records) {
            if (err) {
                console.log("unable to deltem all" + err);
            }
            else {
                console.log('Successfully removed all records from DB');
            }
        });
    };

    var deleteAllDeviceRecords = function(deviceId) {
        console.log("try to remove all records of device " + deviceId);
        Record.remove({
            deviceId : deviceId
        }, function(err, record) {
            if (err) {
                console.log.send(err);
            }
            else {
                console.log('Successfully removed record!' + record);
            }

        });
    };

    //TODO protect check that the dwvice owner is the same doing the call
    // delete all records of a device
    apiRouter.delete('/records/delete/all/:device_id', function(req, res) {
        console.log("try to remove all records of + " + req.params.device_id);
        Record.remove({
            deviceId : req.params.device_id
        }, function(err, record) {
            if (err) {
                res.send(err);
            }
            else {
                res.json(200, {msg: 'Successfully removed all records of ' + req.params.device_id});
            }

        });
    });

    //----------------------------------------------------
    //================DEVICES================================

    var Device  = require('../models/device');
    // get all devices
    apiRouter.get('/devices', function(req, res) {

        var expression = null;
        if(req.owner) {

            console.log("filter devices by owner: " + req.owner);
            expression = {
                owner : req.owner
            };
        }

        if(expression!=null) {
            var query = Device.find(expression);
            query.exec(function (err, devices) {
                if (err)
                    res.send(err)

                res.send(devices);
            });
        }
        else {
            res.json(400, {err: 'Bad request!'});
        }




    });

    apiRouter.get('/devices/:device_id', function(req, res) {

        // use mongoose to get all todos in the database
        Device.findById(req.params.device_id,function(err, device) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(device); // return all devices in JSON format
        });

    });

    // create device and send back all todos after creation
    apiRouter.post('/devices', function(req, res) {

        // create a device, information comes from AJAX request from Angular
        Device.create({

            deviceId: req.body.deviceId,
            description: req.body.deviceDescription,
            owner: req.owner,
            done : false
        }, function(err, device) {
            if (err) {
                console.log("error adding device: " + err);
                res.send(err);
            }
            else {
                console.log("success adding device");
                //send the newly added device as the API response
                res.json(device);
            }

        });

    });

    var deleteDevice = function(deviceId) {
        console.log("try remove device: " + deviceId);
        Device.remove({
            deviceId : deviceId
        }, function(err, device) {
            if (err) {
                console.log(err);
                return false;
            }
            else {
                console.log('Successfully removed device' + device);
                return true;
            }
        });
    };

    //for admin ONLY TODO put separated place
    var deleteAllDevices = function() {
        console.log("try remove all devices from DB: ");
        Device.remove({}, function(err, devices) {
            if (err) {
                console.log("unable to deltem all" + err);
            }
            else {
                console.log('Successfully removed all devices from DB');
            }
        });
    };



    // delete a device
    apiRouter.delete('/devices/:device_id', function(req, res) {
        Device.remove({
            _id : req.params.device_id
        }, function(err, device) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Device.find(function(err, devices) {
                if (err)
                    res.send(err)
                res.json(devices);
            });
        });
    });

    // delete all devices (will also delete all records of that device
    apiRouter.delete('/devices/delete/all/:owner_id', function(req, res) {
        console.log("try to remove all devices of " + req.params.owner_id);

        //find all devices by this user
        var query = Device.find({owner:req.params.owner_id });
        query.exec(function (err, devices) {
            if (err) {
                res.send(err);
            }

            console.log("found " + devices.length + " devices");
            for(var i=0; i < devices.length; i++) {
                var deviceId = devices[i].deviceId;
                var id = devices[i]._id;//DB id
                if(deviceId) {
                    //remove the device by id
                    if(deleteDevice(deviceId)) {
                        //remove all records of this device
                        deleteAllDeviceRecords(id);
                    }
                }

            }
            //express deprecated res.json(status, obj): Use res.status(status).json(obj)
            res.status(200).json({msg: 'Successfully removed devices!'});
        });



    });
    //--------------------------------------------------------

};


/***
 * first rows are the oldest, then the most recent, ordered by creation time ASC
 [
 {
 "_id": "563165ec7012bd173cc42b8e",
 "name": "myname",
 "description": "mydescription",
 "latitude": "27.32939",
 "longitude": "7.3223",
 "time": "2015-10-29T00:18:52.414Z",
 "trackableId": "56327103c8f377a602004571",
 "deviceId": "56301eaa4518091a6d40bf7e",
 "__v": 0
 },
 {
 "_id": "5631661a7012bd173cc42b8f",
 "name": "myname",
 "description": "mydescription",
 "latitude": "22.32939",
 "longitude": "9.3223",
 "time": "2015-10-29T00:19:38.905Z",
 "trackableId": "56327103c8f377a602004571",
 "deviceId": "56301eaa4518091a6d40bf7e",
 "__v": 0
 },
 {
 "_id": "56450c824162cbaf9cf8e2d3",
 "name": "myname2",
 "description": "mydescription2",
 "latitude": "24.32939",
 "longitude": "8.3223",
 "time": "2015-11-29T00:20:38.905Z",
 "trackableId": "56327103c8f377a602004571",
 "deviceId": "56301eaa4518091a6d40bf7e",
 "__v": 0
 }
 ]
 */