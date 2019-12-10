const { check, validationResult } = require('express-validator/check');
module.exports = function(app){

	app.get('/schedullers', function(request, response){
		app.app.controllers.scheduller.list(app, request, response);
	});

	app.get('/scheduller/:schedullerId', function(request, response){
		app.app.controllers.scheduller.get(app, request, response);
	});

	app.get('/scheduller', function(request, response){
		app.app.controllers.scheduller.get(app, request, response);
	});

	app.post('/scheduller', function(request, response){
		app.app.controllers.scheduller.save(app, request, response);
	});

	app.delete('/scheduller/:schedullerId', function(request, response){
		app.app.controllers.scheduller.delete(app, request, response);
	});

}