require('dotenv').load();
var express     	= require('express');
var session     	= require('express-session')

var app         	= express();
var bodyParser  	= require('body-parser');
var morgan      	= require('morgan');

var configure     = require('./configure.js');
var DBstore     	= require('./app/stores/DataBase.js');

//api routes
var WikiRoutes 		= require('./app/routes/WikiRoutes.js');

//services
var WikiService 	= require('./app/services/WikiService.js');
var WikiFetch 		= require('./app/services/WikipediaFetchPeriodicaly.js');

var port = process.env.PORT || 8080;


// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// connect to db
DBstore.connect()
	.then(function(dbInstance) {
		WikiRoutes(app);
		WikiFetch(dbInstance);
	})
	.catch(function(err) {
		console.log(err);
	});

app.listen(port);
console.log('Magic happens at http://localhost:' + port);
