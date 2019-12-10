//modulo para leitura do arquivo de propriedades
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./config/properties.conf');

module.exports.listUsers = function(application, request, response){
	const userModel = new application.app.models.UserDAO(application);
	userModel.get({}, 100, 0, {name: 1}, function(error, result){
		if(error){
			let errors = [];
			errors[0].msg = 'Algo inesperado aconteceu ao buscar os usuários na base'
			response.render('user/users', {errors:errors, result: [] } );	
		} else {
			response.render('user/users', {errors:{}, result: result});
		}
	});
}

module.exports.user = function(application, request, response){
	const userId = request.params.userId;
	let user = undefined;
	if(userId){
		const userModel = new application.app.models.UserDAO(application);
		user = userModel.getByID(userId, function(error, result){
			response.render('user/user', {errors:{}, user:result});
		});
	} else {
		response.render('user/user', {errors:{}, user:{}});
	}	
}

module.exports.saveUser = function(application, request, response){
	let user = request.body;
	request.assert('email', 'E-mail inválido').isEmail();
	request.assert('name', 'Nome é obrigatório').notEmpty();
	const errors = request.validationErrors();
	if(errors && errors.length > 0){
		response.render('user/user', {errors: errors, user:user});
		return;
	}
	let sendEmail = false;
	console.log()
	if(user._id==undefined){
		user.password=randomPass(8);
		sendEmail = true;
	}
	const userModel = new application.app.models.UserDAO(application);
	userModel.save(user, function(error, result){
		console.log(user._id);
		if(sendEmail){
			//TODO enviar a senha por e-mail
			const nodemailer = require('nodemailer');
			const transporter = nodemailer.createTransport({
				host: properties.get('mail.host'),
				port: properties.get('mail.port'),
				secure: properties.get('mail.secure'), // true for 465, false for other ports
				auth: {
					user: properties.get('mail.username'),
					pass: properties.get('mail.password')
				},
				debug: properties.get('mail.debug')
			});

			const mailOptions = {
				from: properties.get('mail.default.from'),
				to: user.email,
				subject: properties.get('user.mail.subject'),
				html: '<html><body><h1>Bem vindo ao sistema</h1><p>Segue abaixo sua senha</p><p>'+user.password+'</p></body></html>'
			};
			console.log("fazendo envio de e-mail"+user.email)
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					console.log(error);
				} else {
					console.log('Email enviado: ' + info.response);
				}
				response.redirect('/user');
			});
		} else {
			response.redirect('/user');
		}
	});
}


function randomPass(length) {
   let result           = '';
   const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const charactersLength = characters.length;
   for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
