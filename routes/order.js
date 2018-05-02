'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var http = require('http');
var Order = AV.Object.extend('Order');

router.post('/add',function(req, res, next) {
	// status: 1 已下单;
	//         2 配送中;
	//         3 已完成;
	var body = req.body;
	if(body.number == ''||body.sellerId == ''||body.userID == ''|| body.animalId == ''){
		var result = {
                code : '302',
                message : '缺少参数',
                data : []
            }
            res.send(result);
        return '';
	}
	var addObj = new Order();
	addObj.set("userID",body.userID);
	addObj.set("number",body.number);
	addObj.set("sellerId",body.sellerId);
	addObj.set("animalId",body.animalId);
	addObj.set("status",1);
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
			message :  "缺少订单id"
		}
		res.send(result);
		return;
	}
	var delObj = AV.Object.createWithoutData('Order', body.id);
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
router.get('/user/list', function(req, res, next) {
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

	var Query = new AV.Query("Order");
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
router.get('/seller/list', function(req, res, next) {
	var query = req.query;
	var id = query.id;
	//创建一个数据库对象
	if(!id){
		var result = {
			code    :  731,
			message :  "缺少卖家id"
		}
		res.send(result);
		return;
	}
	//创建一个数据库对象
	var limit = req.query.limit ? req.query.limit : 1000;
	var skip = req.query.skip ? req.query.skip : 0;

	var Query = new AV.Query("Order");
	Query.equalTo('sellerId',id);
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
			message :  "没有订单ID"
		}
		res.send(result);
		return;
	}
	var Query = new AV.Query("Order");
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

	var editObj = AV.Object.createWithoutData('Order', body.id);
	editObj.set(status,body.status);
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