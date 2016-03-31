var express     = require('express');
var session     = require('express-session')

var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');

var configure     = require('./configure.js');
var connectDB     = require('./app/stores/connectDB.js');

var port = process.env.PORT || 8080;

//api routes


// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// connect to db
var dbInstance = connectDB();
dbInstance.on('error', function() {
      console.log("connection error");
      exit(1);
  });

dbInstance.once("open", function() {
    console.log("DB connection ................ OK ");
    authRoutes(app);
    todoRoutes(app);
    userRoutes(app);
});



app.listen(port);

console.log('Magic happens at http://localhost:' + port);
