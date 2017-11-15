/**
 * Created by paulocristo on 31/10/15.
 */

var ProfileController =  function(req,res) {

};


ProfileController.remoteLogin = function(req,res,next,passport){

    var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var conf = require('../config/config');

    console.log("user: " + req.body.email);
    console.log("pass: " + req.body.password);

    //TODO jsonwebtoken: expiresInMinutes and expiresInSeconds is deprecated. ()
    //expires '1d', '5d'
    //related with keep me logged in for
    var expiresIn = req.body.expire_session;
    console.log("expire_session: " + expiresIn);

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

            // if user is found and password is right
            // create a token
            var jsonToken = jwt.sign(user, conf.secret, {
                //expiresInMinutes: 1440 // expires in 24 hours (default)
                expiresInMinutes: expiresIn || 1440
            });

            //PROTECTION TO NOT ALLOW MORE THAN 5 days and less than 1
            //if(expiresIn && !isNaN(expiresIn)) {
            //    expiresIn = Math.min(1440, 60*24*5);
            //}

            console.log("request headers: " + JSON.stringify(req.headers));
            res.status(200).json(
                {   status: 'Login successful!',
                    email:user.local.email,
                    token:jsonToken,
                    expires: expiresIn
                    //1440
                });

        });
    })(req, res, next);
};

ProfileController.remoteSignup = function(req,res,next,passport){

        var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
        var conf = require('../config/config');
        var User = require('../models/user');


        console.log("user: " + req.body.email);
        console.log("pass: " + req.body.password);

        //**********
        var user = User.create({
            email: req.body.email,
            local : {   email: req.body.email,
                        password: req.body.password
                    }
        }, function(err, account) {

            console.log("accout: " + JSON.stringify(account) + " user: " + JSON.stringify(user));
            /*if (err) {
                return res.status(500).json({err: err});
            }

            console


            req.login(account, function(err) {
                if (err) {
                    return res.status(401).json({err: info});
                }
                return res.redirect('/dashboard');
            });*/

            //passport.authenticate('local')(req, res, function () {
            //    return res.status(200).json({status: 'Registration successful!'});
            //});
            //passport.authenticate('local-login', function(err, user, info) {
            //    if (err) {
            //        return res.status(500).json({err: err});
            //    }
            //    if (!user) {
            //        return res.status(401).json({err: info});
            //    }
                req.logIn(user, function(err) {
                    if (err) {
                        return res.status(500).json({err: 'Could not log in user'});
                    }

                    // if user is found and password is right
                    // create a token
                    var jsonToken = jwt.sign(user, conf.secret, {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    console.log("request headers: " + JSON.stringify(req.headers));
                    res.status(200).json({status: 'Signup successful!',email:user.local.email,token:jsonToken});

                });
           // })(req, res, next);
        });

};

ProfileController.generateUUID = function() {

      var uuid = require('node-uuid');
      return uuid.v4() ;

};

module.exports = ProfileController;