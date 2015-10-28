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

    //app.get('/core.js', function(req, res) {
    //    res.sendfile('./js/core.js');
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
        res.jsonp({ user:req.user.local.email});

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

    // delete a todo
    app.delete('/api/devices/:device_id', function(req, res) {
        Device.remove({
            _id : req.params.todo_id
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
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}