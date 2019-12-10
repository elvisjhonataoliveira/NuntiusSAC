//modulo para chamar e orquestrar o chromium
const puppeteer = require('puppeteer');
//modulo de filesystem
const fs = require('fs');
//modulo para leitura do arquivo de propriedades
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./config/properties.conf');
//modulo para transformar pdf em imagem e recortar
const PDFImage = require("pdf-image").PDFImage;
//modulo para agendamento de tarefas
const nodeSchedule = require('node-schedule-tz');
//modulo para capturar altura/largura d eimagens
const sizeOf = require('image-size');

function MailingSender(){
}

MailingSender.prototype.schedulle = function(application){
	const schedullerModel = new application.app.models.SchedullerDAO(application);
	const schedullers = schedullerModel.getAll({}, function(error, result){
		for(let i = 0 ; i<result.length; i++){
			const scheduller = result[i];
			console.log("Agendando o disparo "+scheduller.name);
			const job = nodeSchedule.scheduledJobs[''+scheduller._id];
			if(job){
				job.cancel();
			}
			nodeSchedule.scheduleJob(''+scheduller._id, scheduller.cron, properties.get('app.timezone'), function(){
					new application.app.modules.MailingSender().run(scheduller._id, application);
			});
		}
	});
}

MailingSender.prototype.run = function(schedullerId, application){
	const schedullerModel = new application.app.models.SchedullerDAO(application);
	schedullerModel.getById(schedullerId, function(error, result){
		console.log(new Date()+'Realizando o disparo do relatório'+result.name);
		generatePdf(result);
	});
}

function generatePdf(report){
	let browser;
	(async () => {
		try{
			/*
				apaga a pasta caso ela exista e faz a criação de uma nova
				cada "disparo" possui uma pasta própria
			*/
			const dir ="./"+report.name;
			if (fs.existsSync(dir)){
	  			fs.rmdirSync(dir, {recursive: true});
			}
			fs.mkdirSync(dir);
			console.log("Iniciando exportação do arquivo");
			browser = await puppeteer.launch({ headless: true });
			const page = await browser.newPage();
			await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: dir})
			//Acessa a página de login
			await page.goto(properties.get('bi.login.endpoint'));
			await page.setViewport({ width: 1280, height: 623 });
			//Espera que todos os redirects sejam efetuados
			await page.waitFor(20000);
			await page.waitForSelector('#logOnForm #j_username');
			//Clica no imput de nome de usuário
			await page.click('#logOnForm #j_username');
			//Digita o nome de usuário
			await page.type('#logOnForm #j_username', properties.get('bi.login.username'));
			//Digita a senha do usuário
			await page.type('#logOnForm #j_password', properties.get('bi.login.password'));
			//Clica no botão de login
			await page.click('.ids-login-login #logOnFormSubmit');
			//Aguarda o login ser realizado
			await page.waitFor(10000);
			//Vai para a página do relatório
			await page.goto(report.reportEndpoint);
			//Aguarda ela ser carregada
			await page.waitFor(15000);
			//Clica no botão para salvar
			await page.click('span[aria-label="save"]');
			//Clica no botão de exportar
			await page.waitFor(3000);
			await page.click('li[aria-posinset="4"]');
			//Clica no botão de baixar pdf
			await page.waitFor(5000);
			await page.click('.sapEpmUiDialogButton.sapEpmUiDialogOkButton.sapMBarChild.sapMBtn.sapMBtnBase.sapMBtnInverted');
			/*
			Monitora a pasta em que o arquivo será baixado.
			Quando é salvo um arquivo a extensão .pdf o processo é encerrado (assume-se que o download foi efetuado)
			*/
			const watcher = fs.watch(dir, function(eventType, filename){
				if(filename.endsWith('pdf')){
					browser.close();
					console.log("Finalizando exportação do arquivo");
					pdf2Image(dir+"/"+filename, report);
					watcher.close();
				}
			});
		} catch(e){
			console.log(e);
			browser.close();
		}
	})();
}

function pdf2Image(originalFile, report){
	console.log("Iniciando conversão: "+originalFile)
	const pdfFile = new PDFImage(originalFile);
	pdfFile.convertFile().then(function(imagePaths) {
    	sendEmail(imagePaths, report);
 	});
}

function sendEmail(imagePaths, report){
	console.log("Realizando disparo de e-mail");
	const nodemailer = require('nodemailer');
	const transporter = nodemailer.createTransport({
		host: properties.get('mail.host'),
		port: properties.get('mail.port'),
		secure: true, // true for 465, false for other ports
		auth: {
			user: properties.get('mail.username'),
			pass: properties.get('mail.password')
		},
		debug: true
	});

	let attachments = [];
	const pages = report.pages.split(',');
	let subject = report.name;
	let messageBody = '<html><body><table>';
	if(report.sendPdf || report.sendImage){
		for(let i = 0; i<pages.length; i++){
			let attach = {};
			let fileName = pages[i].split('-')[1]+'.png';
			let pageNumber = pages[i].split('-')[0];
			attach.filename = fileName;
			attach.path = imagePaths[(pageNumber-1)];
			attachments.push(attach);
			if(report.sendImage){
				let cid = "cidpageimg"+i;
				let attachImg = JSON.parse(JSON.stringify(attach));
				attachImg.cid = cid;
				attachImg.filename = "img"+i+".png";
				attachments.push(attachImg);

				let dimensions = sizeOf(attach.path);
				console.log(dimensions.width, dimensions.height);
				messageBody+= '<tr> <td> <img src="cid:'+cid+'" width="'+dimensions.width+'" height="'+dimensions.height+'" style="width:'+dimensions.width+'; height:'+dimensions.height+'" /> </td> </tr>';
			}
		}
	}
	if(report.sendDisclaimer){
		messageBody+=properties.get('mail.default.diclaimer');
	}
	messageBody+='</table></body></html>';
	
	if(report.addHour){
		let date = new Date().getTime();
		date -= (3 * 60 * 60 * 1000);
		const hour = new Date(date).getUTCHours();
		subject+=' '+hour+':00hrs';
	}

	const mailOptions = {
		from: report.mailFrom,
		to: report.mailTo,
		subject: subject,
		attachments: attachments,
		html: messageBody,
		replyTo: report.replyTo!=undefined?report.replyTo:report.mailFrom
	};
	console.log("Fazendo envio de e-mail");
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email enviado: ' + info.response);
		}
	});


}

module.exports = function(){
	return MailingSender;
}