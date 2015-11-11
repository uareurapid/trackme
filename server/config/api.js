/**
 * Created by paulocristo on 10/11/15.
 */

//API ROUTES
module.exports = function(app) {

//TODO authenticate API REQUESTS
//https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

    //================== trackables ======================

    var Trackable  = require('../models/trackable');
    // get all trackables
    app.get('/api/trackables', function(req, res) {


        var expression = null;
        if(req.query.owner) {

            console.log("filter trackables by owner: " + req.query.owner);
            expression = {
                owner : req.query.owner
            };
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
            Trackable.find(function(err, trackables) {

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)

                res.json(trackables); // return all trackables in JSON format
            });
        }

    });

    // create trackables and send back all todos after creation
    app.post('/api/trackables', function(req, res) {

        //only used if privacy protected
        var protectedCode = "";
        if(req.body.privacy=="Protected") {
            //var ProfileController = require('../controllers/profile.js');
            protectedCode = ProfileController.generateUUID();
        }

        console.log("received: " + JSON.stringify(req.body));
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
                //send the trackable json
                res.json(trackable);
            }

        });

    });

    // delete a trackable
    app.delete('/api/trackables/:trackable_id', function(req, res) {
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

    //---------------------------------------------------------------------
    // Email API
    app.get('/api/sendmail', function(req,res) {

        var MailerService = require('../controllers/mail.js');
        MailerService.sendEmail(req,res, function(response) {
            console.log("my callback response: " + response);
        });
    });

    //-----------------------------------------------------------------------
    //===============Records=============
    var Record  = require('../models/record');
    // get all records
    app.get('/api/records', function(req, res) {

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

            var query = Record.find(expression);
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
            });
        }

    });

    // create device and send back all todos after creation
    app.post('/api/records', function(req, res) {

        console.log("latitude: "+req.body.longitude);
        //Return the number of milliseconds since 1970/01/01:
        var timeOfRecord = new Date().getTime();
        // create a record, information comes from AJAX request from Angular
        Record.create({


            name: req.body.name,
            description: req.body.description,
            latitude: req.body.latitude,
            longitude : req.body.longitude,
            time: timeOfRecord,
            trackableId: req.body.trackableId,
            deviceId: req.body.deviceId,
            done: false
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

    // delete a record
    app.delete('/api/records/:record_id', function(req, res) {
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

    //----------------------------------------------------
    //================DEVICES================================

    var Device  = require('../models/device');
    // get all devices
    app.get('/api/devices', function(req, res) {


        var expression = null;
        if(req.query.owner) {

            console.log("filter devices by owner: " + req.query.owner);
            expression = {
                deviceOwner : req.query.owner
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
            //TODO NOT POSSIBLE!!!
            // use mongoose to get all todos in the database
            Device.find(function(err, devices) {

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)

                res.json(devices); // return all devices in JSON format
            });
        }




    });

    app.get('/api/devices/:device_id', function(req, res) {

        // use mongoose to get all todos in the database
        Device.findById(req.params.device_id,function(err, device) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(device); // return all devices in JSON format
        });

    });

    // create device and send back all todos after creation
    app.post('/api/devices', function(req, res) {

        // create a device, information comes from AJAX request from Angular
        Device.create({

            deviceId: req.body.deviceId,
            deviceDescription: req.body.deviceDescription,
            deviceOwner: req.body.owner,
            done : false
        }, function(err, device) {
            if (err) {
                res.send(err);
            }
            else {
                //send the newly added device as the API response
                res.send(device);
            }

        });

    });

    // delete a device
    app.delete('/api/devices/:device_id', function(req, res) {
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
    //--------------------------------------------------------

};