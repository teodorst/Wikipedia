WikiService 			= require('../services/WikiService.js');

module.exports = function(app) {
	// app wiki routes

	// main route for find queries
	app.get('/', function(req, res) {
		// convert categories to lower case
		var category = req.query.category && req.query.category.toLowerCase();

		// call service function for this route
		WikiService.getData(req.query.day, req.query.year, req.query.category,
			req.query.keyword)
			.then(function(data) {
				//check if we found items
				if (data.length === 0) {
					res.status(404)
				}
				else {
					res.status(200);
				}
				res.json({
					results: data,
					length: data.length
				});
			})
			.catch(function(err) {
				console.log(err);
				res.status(500).json({
					message: err
				});
			});
	});
}
