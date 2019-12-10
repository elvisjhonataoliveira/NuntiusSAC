const nodeSchedule = require('node-schedule-tz');
//modulo para leitura do arquivo de propriedades
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./config/properties.conf');

module.exports.list = function(application, request, response){
	const schedullerModel = new application.app.models.SchedullerDAO(application);
	schedullerModel.get({}, 100, 0, {name: 1}, function(error, result){
		if(error){
			let errors = [];
			errors[0].msg = 'Algo inesperado aconteceu ao buscar os usuários na base';
			response.render('scheduller/schedullers', {errors:errors, schedullers: errors } );	
		} else {
			response.render('scheduller/schedullers', {errors:{}, schedullers: result});
		}
	});
}

module.exports.get = function(application, request, response){
	const schedullerId = request.params.schedullerId;
	if(schedullerId!=undefined){
		const schedullerModel = new application.app.models.SchedullerDAO(application);
		schedullerModel.getById(schedullerId, function(error, result){
			response.render('scheduller/scheduller', {errors: {}, scheduller: result});
		});		
	} else {
		response.render('scheduller/scheduller', {errors: {}, scheduller:{}});
	}
}

module.exports.save = function(application, request, response){
	const scheduller = request.body;
	request.assert('sendOption', 'Selecione se o e-mail irá com PDF (em anexo) ou com Imagem (no corpo do email)').custom(function(){
		if(scheduller.sendPdf || scheduller.sendImage){
			return true;
		}
		return false;
	});
	request.assert('name', 'Dê um nome ao disparo para fácil identificação.').notEmpty();
	request.assert('mailFrom', 'Especifique o e-mail que será utilizado como "remetente" para o disparo.').notEmpty();
	request.assert('mailTo', 'Especifique o e-mail das pessoas que precisam receber o relatório.').notEmpty();
	request.assert('reportEndpoint', 'É necessário especificar a URL do relatório.').notEmpty();
	request.assert('pages', 'Especifique as páginas do relatório que deverão ser enviadas no e-mail').notEmpty();
	request.assert('cron', 'Especifique um cron para execução do disparo.').notEmpty();
	const errors = request.validationErrors();
	if(errors && errors.length>0){
		response.render('scheduller/scheduller', {errors:errors, scheduller: scheduller } );
		return;
	}
	const schedullerModel = new application.app.models.SchedullerDAO(application);
	schedullerModel.save(scheduller, function(error, result){
		if(error){
			let errors = [];
			errors[0] = error;
			response.render('scheduller/scheduller', {errors:errors, scheduller: scheduller} );
		} else {
			//TODO iniciar scheduller
			const job = nodeSchedule.scheduledJobs[''+scheduller._id];
			if(job){
				job.cancel();
			}

			nodeSchedule.scheduleJob(''+scheduller._id, scheduller.cron, properties.get('app.timezone'), function(){
  				new application.app.modules.MailingSender().run(scheduller._id, application);
			});
			response.redirect('/schedullers');
		}
	});
}

module.exports.delete = function(application, request, response){
	const schedullerId = request.params.schedullerId;
	const schedullerModel = new application.app.models.SchedullerDAO(application);
	schedullerModel.delete(schedullerId, function(error, result){
		if(error){
			response.send({success: false, error: 'Erro ao excluir relatório.'});
		} else {
			response.send({success: true});
		}
	});	
}