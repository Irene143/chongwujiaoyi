'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var http = require('http');

var Animals = AV.Object.extend('Animals');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

// 新增
router.post('/fileup',multipartMiddleware, function(req, res, next){
	var photo = req.files.photo;
	var url;
	fs.readFile(photo.path, function(err, data){
        if(err)
            return res.send("读取文件失败");
        var base64Data = data.toString('base64');
        var theFile = new AV.File(photo.name, {base64: base64Data});
        theFile.save().then(function(theFile){
        	url = theFile.url();
           	// console.log(theFile.url());
            res.send(url);
        });
    });
})

function saveFile(i,fileArray,filePartData,callback){
		if(i >= fileArray.length){//判断是否是最后一个文件
			return callback.success(filePartData);//返回成功上传
		}
		var fileData = fileArray[i];//获取一个文件信息
		fs.readFile(fileData.path, function(err, data){//读取文件
	        if(err){//读取失败判断
				var data = "读取文件失败";
				return callback.error(data);//返回读取失败
			}
	        var base64Data = data.toString('base64');//将文件转为base64
	        var theFile = new AV.File(fileData.name, {base64: base64Data});//新建文件信息
	        theFile.save().then(function(theFileData){//保存文件信息
	        	var url = theFileData.attributes.url;//获取成功保存后的文件链接
				filePartData[fileData.fieldName] = url;//将文件name保存到数据
				saveFile(i+1,fileArray,filePartData,callback);//递归代用该方法
	        },function(error){
				console.log(error);
				return callback.error(data);//返回保存失败
			});
	    });
}
router.post('/add',multipartMiddleware, function(req, res, next) {
	// price:价格
	// area:地区
	// sex:性别
	// birth:出生日期
	// type:品种
	// hairColor:毛色
	// quChong:驱虫情况
	// yiMiao:疫苗情况
	// carriage:运费
	// sellerId:卖家ID
	// images:宠物照片
	//status:宠物状态
	var data = {
		price:'',
		area:'',
		sex:'',
		birth:'',
		type:'',
		hairColor:'',
		quChong:'',
		yiMiao:'',
		carriage:'',
		sellerId:''
	}
	var body = req.body;
	if(body.price==''||body.area==''||body.sex==''||body.birth==''||body.type==''||body.hairColor==''||body.quChong==''||body.yiMiao==''||body.carriage==''||body.sellerId==''){
		var result = {
                code : '302',
                message : '缺少参数',
                data : []
            }
            res.send(result);
        return '';
	}
	saveFile(0,files,fileData,{
		success:function(fileData){
			if(!fileData || (fileData && !fileData.photo)){
				var result = {
					code : '302',
					message : '缺少宠物图片',
					data : []
				}
				res.send(result);
				return;
			}

			var query = new AV.Query(Animals);
			data.images = fileData.photo;
			query.equalTo('images',data.images);
			query.find().then(function(results) {
				//判断是否存在
				if(results.length){
					//存在
					var result = {
				   		code : 601,
				    	message : '项目已存在'
					}
					res.send(result);
				}else{
					//不存在
					//创建应用
					var addObj = new Animals();
					for(var key in data){
						addObj.set(key,data[key]);
					}
					var animalsImg = [];
					addObj.set("animalsImg",animalsImg);
					addObj.set("status",0);
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
				}
			}, function(err) {
				if (err.code === 101) {
					res.send(err);
		  		} else {
		      		next(err);
		    	}
			}).catch(next);
		},
		error:function(error){
			console.log(error);
		}
	});
})

// 删除
router.post('/delete', function(req, res, next) {
	var body = req.body;
	var id = body.id;
	//创建一个数据库对象
	if(!id){
		var result = {
			code    :  731,
			message :  "缺少宠物id"
		}
		res.send(result);
		return;
	}
	var delObj = AV.Object.createWithoutData('Animals', body.id);
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

// 编辑
router.post('/edit', function(req, res, next) {
	var body = req.body;
	var id = body.id;
	if(!id){
		var result = {
			code : 731,
			message : "缺少宠物id"
		}
		res.send(result);
		return;
	}

	var editObj = AV.Object.createWithoutData('Animals', body.id);
	for(var key in body){
		editObj.set(key,body[key]);
	}
	if(body.animalsImg){
		editObj.set("animalsImg",JSON.parse(body.animalsImg));
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

// 查找
router.get('/list', function(req, res, next) {
	//创建一个数据库对象
	var status  = req.query.status ? req.query.status : 1;
	var limit = req.query.limit ? req.query.limit : 1000;
	var skip = req.query.skip ? req.query.skip : 0;

	var status = parseInt(status);
	var Query = new AV.Query("Animals");
	if(status != 0){
		Query.equalTo("status",status);
	}
	
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

// 详情
router.get('/detail', function(req, res, next) {
	var id = req.query.id;
	//创建一个数据库对象
	if(!id){
		var result = {
			code    :  731,
			message :  "没有宠物ID"
		}
		res.send(result);
		return;
	}
	var Query = new AV.Query("Animals");
	Query.get(id,{
		success:function(result){
			res.send(result);
		},
		error:function(err){
			res.send(err);
		}
	})
})
router.post('/m/changeStatus', function(req, res, next) {
	var id = req.query.id;
	if(!id){
		var result = {
			code    :  731,
			message :  "没有宠物ID"
		}
		res.send(result);
		return;
	}
	var editObj = AV.Object.createWithoutData('Animals', body.id);
	editObj.set("status",req.query.status);
	editObj.save().then(function (addResult) {
		var result = {
			code : 200,
			data : addResult,
			message : '修改状态成功'
		}
			res.send(result);
		}, function (error) {
			var result = {
				code : 500,
				message : '修改状态出错'
			}
				res.send(result);
		});
})
module.exports = router;