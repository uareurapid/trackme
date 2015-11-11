var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var passport = require('passport'); //passport authentication
var session  = require('express-session');//express session
var cookieParser = require('cookie-parser');//read the cookies for auth
var flash    = require('connect-flash');
var db = require('./config/db');

//configurations for the json tokens
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config/config');
app.set('superSecret', config.secret); // secret variable

mongoose.connect(db.url);

//serve js,css and images from public folder
app.use(express.static('public'));


//EJS tutorial
//https://scotch.io/tutorials/use-ejs-to-template-your-node-application

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser()); // read cookies (needed for auth)

//app.use(bodyParser()); // get information from html forms
//app.set('view engine', 'ejs'); // set up ejs for templating

require('./config/passport')(passport); // pass passport for configuration

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// application -------------------------------------------------------------
// Configure normal routes
// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//Authentocation stuff
//https://scotch.io/courses/easy-node-authentication
//https://scotch.io/tutorials/easy-node-authentication-setup-and-local

//===============================
// REST API
//===============================
// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();
// get an instance of the express Router

//-----------------------------------------------
// middleware to use for all requests
// route middleware to verify a token
//-----------------------------------------------
router.use(function(req, res, next) {

  console.log("checking tokens and all that stuff");
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.signedCookies.token;
  console.log("i have the cookies: " + req.signedCookies.token);
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
});

// ---------------------------------------------------------
// Configure authenticated routes
// ---------------------------------------------------------
require('./config/api.js')(router);

//TODO check https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4

// more routes for our API will happen here
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

/*
router.use('xpto',function (req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('Client IP:', ip);
  next();
});*/


// set our port
var port = process.env.PORT || 8080;
// START THE SERVER
// =============================================================================
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

//https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular
// https://scotch.io/tutorials/easy-node-authentication-setup-and-local