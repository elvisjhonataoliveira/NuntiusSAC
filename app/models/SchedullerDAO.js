const ObjectId = require('mongodb').ObjectID;
let db;
const collectionName = 'scheduller'

function SchedullerDAO(app){
	db = app.config.dbconnection.getDb();
}

SchedullerDAO.prototype.getById = function(schedullerId, callback){
	db.collection(collectionName).findOne({_id : new ObjectId(schedullerId)}, callback);
}

SchedullerDAO.prototype.get = function(filters, limit, page, sortBy, callback){
	db.collection(collectionName).find(filters).skip(limit*page).limit(limit).sort(sortBy).toArray(callback);
}

SchedullerDAO.prototype.getAll = function(sortBy, callback){
	db.collection(collectionName).find().sort(sortBy).toArray(callback);
}

SchedullerDAO.prototype.save = function(scheduller, callback){
	scheduller.updatedDate = new Date();
	if(scheduller._id!=undefined){
		scheduller._id = new ObjectId(scheduller._id);
	} else {
		scheduller.creationDate = new Date();
	}
	db.collection(collectionName).save(scheduller, callback);
}

SchedullerDAO.prototype.delete = function(schedullerId, callback){
	db.collection(collectionName).deleteOne({_id : new ObjectId(schedullerId)}, callback);
}

module.exports = function(){
	return SchedullerDAO;
}
