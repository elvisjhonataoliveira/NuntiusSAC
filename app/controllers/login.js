module.exports.login = function(application, request, response){
	response.render('login/login', {errors: undefined});
}

module.exports.authenticate = function(application, request, response){
	const userLogin = request.body;
	request.assert('email', 'E-mail é obrigatório.').notEmpty();
	request.assert('email', 'E-mail inválido').isEmail();
	request.assert('password', 'Digite sua senha.').notEmpty();
	const errors = request.validationErrors();
	if(errors && errors.length>0){
		response.render('login/login', {errors: errors})
		return;
	}
	if(userLogin.email=='admin' && userLogin.password=='admin'){
		//first access
		request.session.userLogged=userLogin;
		response.redirect('/home');
		return;
	}


	const userModel = new application.app.models.UserDAO(application);
	userModel.get({email: userLogin.email}, 1, 0, {}, function(error, result){
		if(error || result.length==0){
			let errors = [];
			errors[0] = {msg: 'Usuário não encontrado'};
			response.render('login/login', {errors: errors});
			return;
		}
		if(result[0].password == userLogin.password){
			request.session.userLogged=result[0];
			response.redirect('/home');
			return;
		}
		let errors = [];
		errors[0] = {msg: 'Senha inválida para esse usuário'};
		response.render('login/login', {errors: errors});
	});

}