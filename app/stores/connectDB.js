var mongoose = require('mongoose');
var q        = require('q');
mongoose.Promise = q.Promise;

var dbInstance;

module.exports = {
	connect: function( url ) {
	  url = url || process.env.DB_URL;
	  if( !dbInstance && url ) {
	    mongoose.connect(url);
	    dbInstance = mongoose.connection;
	    return dbInstance;
	  }
	  return dbInstance;
	},
	onConnectionSuccess: function(app) {
		console.log("DB connection ................ OK ");
	},
	onConnectionFailed: function(err) {
		console.log("DB connection ................ FAIL ");
	}
