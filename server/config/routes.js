/**
 * Created by paulocristo on 26/10/15.
 */

//routes that do not need token authentication

// app/routes.views
module.exports = function(app, passport) {

    //have a reference to the profile controller
    var ProfileController = require('../controllers/profile.js');

    var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var conf = require('./config');

    // show the home page
    app.get('/home', function(req, res) {
        if(req.isAuthenticated()) {
           console.log("received: "+req.user.local.email) ;
           res.sendfile('./views/home.html', {username: req.user.local.email }); // map/home page
           // load the single view file (angular will handle the page changes on the front-end)
        }
        else {
            //send him to login page
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }
        
        
    });

    //########################### checkProtectedRouteParams #################################################
    //Auxiliar function to check if neeeded parameters are present in the request
    //for protected trackables we need the "tid" and "unlock_code"
    //for public trackables we only need the "tid"
    var checkProtectedRouteParams = function(req) {

        var CONSTANTS = require('./constants');
        var url = require('url');
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        console.log("PROTECTED REQUEST: " + JSON.stringify(query) + " req.originalUrl: " +
            req.originalUrl + " : " + CONSTANTS.PROTECTED_PATH);

        if(req.originalUrl.indexOf(CONSTANTS.PUBLIC_PATH)>-1) {

            return query[CONSTANTS.QUERY_STRING.TRACKABLE_ID];
        }
        //request for a protected trackable?
        else if(req.originalUrl.indexOf(CONSTANTS.PROTECTED_PATH)>-1) {

            return query[CONSTANTS.QUERY_STRING.UNLOCK_CODE] && query[CONSTANTS.QUERY_STRING.TRACKABLE_ID];

        }
    };
    //############################################################################

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });


    // =====================================
    // PROTECTED MAP ===============================
    // =====================================
    app.get('/protected', function(req, res) {

        var result = checkProtectedRouteParams(req);
        if(!result) {
            res.redirect('/home');//TODO app some landing page for bad requests??
        }
        else {
            res.render('protected.ejs');
        }

    });

    //get the trackable details to show on the map
    app.get('/trackable_records', function(req, res) {

        console.log("PROTECTED trackable_records ROUTE CALLED");
        //***** get the query params ********
        var url = require('url');
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        var filterById = null;
        var filterByUnlockCode = null;
        //***********************************
        //trackable id is manadatory, always, for a protected or public
        //unlock code is only mandatory for proteceted trackables
        if(!query.tid) {
            res.json(403, {err: 'Unauthorized!'});
        }
        else {
            filterById = query.tid;
        }

        if(query.unlock_code) {

            filterByUnlockCode = query.unlock_code;

        }

        //TODO check also http://mongoosejs.com/docs/queries.html
        var Trackables = require('../models/trackable.js');

        if(filterByUnlockCode!==null) {

            Trackables.find()
                .and([
                //filter expression
                {_id :filterById}, {unlockCode: filterByUnlockCode}
                ])
                .exec(function(err, trackable) {
                //could not find the trackable info, ABORT
                if (err || !trackable || trackable.length==0) {
                    res.json(403, {err: 'Unauthorized!'});
                }
                else {
                    //now get the records
                    var Records = require('../models/record.js');
                    Records.find(
                        //filter expression
                        {
                            trackableId: query.tid
                        },function(err, record) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.json(record);
                            }

                        });
                }
               });
        }
        else {
            //JUST FILTER BY ID
            Trackables.find(
                //filter expression
                {
                    _id :filterById
                },function(err, trackable) {
                    //could not find the trackable info, ABORT
                    if (err || !trackable) {
                        res.send(err);
                    }
                    else {
                        //now get the records
                        var Records = require('../models/record.js');
                        Records.find(
                            //filter expression
                            {
                                trackableId: query.tid
                            },function(err, record) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    res.json(record);
                                }

                            });
                    }

                });
        }






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

    app.post('/login', function(req,res,next) {

        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return res.status(500).json({err: err});
            }
            if (!user) {
                return res.status(401).json({err: info});
            }
            req.logIn(user, function(err) {
                if (err) {
                    return res.status(500).json({err: 'Could not log in user'});
                }

                //TODO i can generate a random uuid for this user that will be the given secret
                //than have a table that associates secret keys with usernames
                // if user is found and password is right
                // create a token
                var jsonToken = jwt.sign(user, conf.secret, {
                    expiresInMinutes: 1440 // expires in 24 hours
                });

                console.log("request headers: " + JSON.stringify(req.headers));
                //set a token
                res.cookie('token', jsonToken);
                //also set it on the response url
                res.redirect('/home');

            });
        })(req, res, next);
    });

    //TODO
    //http://mherman.org/blog/2015/07/02/handling-user-authentication-with-the-mean-stack/#
    //http://passportjs.org/docs/authenticate
    //CUSTOM CALLBACK EXAMPLE
    //remote login only
    app.post('/rlogin', function(req, res, next) {

        console.log("rlogin was called");
        //var ProfileController = require('../controllers/profile.js');
        ProfileController.remoteLogin(req,res,next,passport);

    });

    app.post('/rsignup', function(req, res, next) {

        console.log("rsignup called");
        //var ProfileController = require('../controllers/profile.js');
        ProfileController.remoteSignup(req,res,next,passport);

    });

    //return username
    app.get('/profile/user', function (req, res) {
        console.log('GET profile/user');
        console.log("request headers: " + JSON.stringify(req.headers));
        //console.log(req.user.local.email);
        res.jsonp({ username:req.user.local.email});

    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        console.log("user logout...");

        /**
         * If you want to fully clear the session for the user on logout you can call
         * req.session.destroy() from your everyauth.everymodule.handleLogout
         * function. Only req.session.auth is cleared when you call req.logout().
         */
        if(req.isAuthenticated()) {


            res.clearCookie('connect.sid', { path: '/' });
            res.clearCookie('token', { path: '/' });
            req.logout();
        }
        res.redirect('/');

    });

    app.get('/rlogout', function(req, res) {
        console.log("user remote logout...");

        /**
         * If you want to fully clear the session for the user on logout you can call
         * req.session.destroy() from your everyauth.everymodule.handleLogout
         * function. Only req.session.auth is cleared when you call req.logout().
         */
        if(req.isAuthenticated()) {


            res.clearCookie('connect.sid', { path: '/' });
            res.clearCookie('token', { path: '/' });
            req.logout();
        }
        res.json(200,{status: 200, message: "Logout success!"});

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