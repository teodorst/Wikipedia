require('dotenv').load();
var MongoClient 		= require('mongodb').MongoClient;
var q        				= require('q');

var dbInstance;

module.exports = {
	connect: function( url ) {
	  url = url || process.env.DB_URL;
		return new Promise(function(resolve, reject) {
			if( !dbInstance && url ) {
				MongoClient.connect(url)
					.then(function(db) {
						console.log("DB connection ................ OK ");
						dbInstance = db;
						resolve(db);
					})
					.catch(function(err){
						console.log("DB connection ................ FAIL ");
						reject(err);
					});
			}
			else {
				resolve(dbInstance);
			}
		});
	},
	getDBInstance: function() {
		return dbInstance;
	},
	closeConnection: function(force) {
		dbInstance.close(force);
	}
};
