'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var http = require('http');
var Address = AV.Object.extend('Address');

router.post('/add',function(req, res, next) {
	var body = req.body;
	if(body.id == ''||body.address == ''){
		var result = {
                code : '302',
                message : '缺少参数',
                data : []
            }
            res.send(result);
        return '';
	}
	var addObj = new Address();
	addObj.set("userID",body.id);
	addObj.set("address",body.address);
	addObj.save().then(function (addResult) {
		var result = {
			code : 200,
			data : addResult,
			message : '保存成功'
		}
		res.send(result);
		}, function (error) {
			var result = {
				code : 500,
				message : '保存出错'
			}
			res.send(result);
		});
})
router.post('/delete', function(req, res, next) {
	var body = req.body;
	var id = body.id;
	//创建一个数据库对象
	if(!id){
		var result = {
			code    :  731,
			message :  "缺少收货地址id"
		}
		res.send(result);
		return;
	}
	var delObj = AV.Object.createWithoutData('Address', body.id);
	delObj.destroy().then(function (success) {
		// 删除成功
		var result = {
		   	code : 200,
		   	data : [],
		    message : '删除成功'
		}
		res.send(result);
	}, function(error) {
		res.send(error);
	}).catch(next);
})
router.get('/list', function(req, res, next) {
	var query = req.query;
	var id = query.id;
	//创建一个数据库对象
	if(!id){
		var result = {
			code    :  731,
			message :  "缺少用户id"
		}
		res.send(result);
		return;
	}
	//创建一个数据库对象
	var limit = req.query.limit ? req.query.limit : 1000;
	var skip = req.query.skip ? req.query.skip : 0;

	var Query = new AV.Query("Address");
	Query.equalTo('userID',id);
	Query.limit(limit);
	Query.skip(skip);
	Query.find().then(function (results) {
		// 删除成功
		var result = {
		   	code : 200,
		   	data : results,
		    message : '获取成功'
		}
		res.send(result);
	}, function(error) {
		res.send(error);
	}).catch(next);
})
router.post('/detail', function(req, res, next) {
	var body = req.body;
	var id = body.id;
	//创建一个数据库对象
	if(!id){
		var result = {
			code    :  731,
			message :  "没有地址ID"
		}
		res.send(result);
		return;
	}
	var Query = new AV.Query("Address");
	Query.get(id,{
		success:function(result){
			res.send(result);
		},
		error:function(err){
			res.send(err);
		}
	})
})
router.post('/edit', function(req, res, next) {
	var body = req.body;
	var id = body.id;
	if(!id){
		var result = {
			code : 731,
			message : "缺少地址id"
		}
		res.send(result);
		return;
	}

	var editObj = AV.Object.createWithoutData('Address', body.id);
	for(var key in body){
		editObj.set(key,body[key]);
	}
	editObj.save().then(function (addResult) {
		var result = {
			code : 200,
			data : addResult,
			message : '保存成功'
		}
			res.send(result);
		}, function (error) {
			var result = {
				code : 500,
				message : '保存出错'
			}
				res.send(result);
		});
})
module.exports = router;