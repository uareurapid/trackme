/**
 * Created by paulocristo on 26/10/15.
 */


// app/routes.views
module.exports = function(app, passport) {

    // show the home page
    app.get('/home', function(req, res) {
        if(req.isAuthenticated()) {
           console.log("received: "+req.user.local.email) ;
           res.sendfile('./views/home.html', {username: req.user.local.email }); // map/home page
           // load the single view file (angular will handle the page changes on the front-end)
        }
        else {
            //send him to login page
            res.render('login.ejs');
        }
        
        
    });

    //app.get('/trackme-angular-core.js', function(req, res) {
    //    res.sendfile('./js/trackme-angular-core.js');
    //});

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    // render the page and pass in any flash data if it exists
    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); // login page
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    // render the page and pass in any flash data if it exists
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') }); // signup page
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/home', // (profile) redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //return username
    app.get('/profile/user', function (req, res) {
        console.log('profile/user');
        console.log(req.user.local.email);
        res.jsonp({ username:req.user.local.email});

    });


    //app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
      //  res.render('signup.ejs', { message: req.flash('signupMessage') });
    //});



    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    //app.get('/profile', isLoggedIn, function(req, res) {
    //    res.render('profile.ejs', {
    //        user : req.user // get the user out of session and pass to template
    //    });
    //});

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        console.log("user logout...");
        req.logout();
        res.redirect('/');
    });


    //================DEVICES================================

    var Device  = require('../models/device');
    // get all devices
    app.get('/api/devices', function(req, res) {

        // use mongoose to get all todos in the database
        Device.find(function(err, devices) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(devices); // return all devices in JSON format
        });

    });

    // create device and send back all todos after creation
    app.post('/api/devices', function(req, res) {

        // create a device, information comes from AJAX request from Angular
        Device.create({

            deviceId: req.body.deviceId,
            deviceDescription: req.body.deviceDescription,
            deviceOwner: req.body.deviceOwner,
            done : false
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

    // delete a device
    app.delete('/api/devices/:device_id', function(req, res) {
        Device.remove({
            _id : req.params.device_id
        }, function(err, device) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Todo.find(function(err, devices) {
                if (err)
                    res.send(err)
                res.json(devices);
            });
        });
    });

    //===============Records=============
    var Record  = require('../models/record');
    // get all records
    app.get('/api/records', function(req, res) {

        // use mongoose to get all records in the database
        Record.find(function(err, records) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(records); // return all records in JSON format
        });

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

    //================== trackables ======================

    var Trackable  = require('../models/trackable');
    // get all trackables
    app.get('/api/trackables', function(req, res) {

        // use mongoose to get all records in the database
        Trackable.find(function(err, trackables) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(trackables); // return all trackables in JSON format
        });

    });

    // create trackables and send back all todos after creation
    app.post('/api/trackables', function(req, res) {

        //Return the number of milliseconds since 1970/01/01:
        var timeOfCreation = new Date().getTime();
        // create a device, information comes from AJAX request from Angular
        Trackable.create({

            name: req.body.name,
            description: req.body.description,
            owner: req.body.owner,
            creationDate: timeOfCreation,
            type: req.body.type,
            done : false
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

    // delete a trackable
    app.delete('/api/trackables/:trackable_id', function(req, res) {
        Device.remove({
            _id : req.params.trackable_id
        }, function(err, trackable) {
            if (err)
                res.send(err);

            // get and return all the trackables after you create another
            Todo.find(function(err, trackables) {
                if (err)
                    res.send(err)
                res.json(trackables);
            });
        });
    });

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}