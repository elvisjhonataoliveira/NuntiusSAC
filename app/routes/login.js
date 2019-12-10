module.exports = function(app){

	app.get('/', function(request, response){
		app.app.controllers.login.login(app, request, response);
	});

	app.post('/', function(request, response){
		app.app.controllers.login.authenticate(app, request, response);
	});

}