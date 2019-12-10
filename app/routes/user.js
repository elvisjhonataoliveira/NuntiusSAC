module.exports = function(app){
	app.get('/user', function(request, response){
		app.app.controllers.user.listUsers(app, request, response);
	});
	
	app.get('/user/me', function(request, response){
		request.params.userId=request.session.userLogged._id;
		app.app.controllers.user.user(app, request, response);
	});
	
	app.get('/user/:userId', function(request, response){
		app.app.controllers.user.user(app, request, response);
	});
	
	app.get('/user-new', function(request, response){
		app.app.controllers.user.user(app, request, response);
	});

	
	app.post('/user', function(request, response){
		app.app.controllers.user.saveUser(app, request, response);
	});
}