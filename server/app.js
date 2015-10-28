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
//var mongoose = require('mongoose');
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

// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//Authentocation stuff
//https://scotch.io/courses/easy-node-authentication
//https://scotch.io/tutorials/easy-node-authentication-setup-and-local

//===============================
// REST API
//===============================

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();
// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/test', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

//TODO check https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4

// more routes for our API will happen here
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);




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