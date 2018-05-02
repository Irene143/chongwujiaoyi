'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var http = require('http');

function validate(res,req,data){
    for(var i in data){
        if(req.method == 'GET'){
            var value = req.query[i];
        }else{
            var value = req.body[i];
        }
        if(data[i]){
            //必须值
            if(!value){
                var result = {
                    code : '302',
                    message : '缺少'+data[i],
                    data : []
                }
                res.send(result);
                return '';
            }
        }
        data[i] = value;
    }
    return data;
}

  // 新增
router.post('/signUp', function(req, res, next) {
    var data = {
        userName : '用户名',
        passWord : '密码',
        birth : '生日',
        sex: '性别',
        area:"地区"
    }
    var data = validate(res,req,data);
    if(!data){
        return;
    }
    console.log(data);
    var user = new AV.User();
    // 设置用户名
    user.setUsername(data.userName);
    // 设置密码
    user.setPassword(data.passWord);
    user.signUp().then(function (loginedUser) {
      // console.log(loginedUser);
      loginedUser.set('birth', data.birth);
      loginedUser.set('sex', data.sex);
      loginedUser.set('area', data.area);
      loginedUser.set('identity','普通用户');
      loginedUser.save();
      var result = {
                    code : 200,
                    data : loginedUser,
                    message : '保存成功'
                }
                res.send(result);
        }, function (error) {
            console.log(error);
            var result = {
                    code : 500,
                    message : '保存出错'
                }
                res.send(result);

    });
})
router.post('/login', function(req, res, next) {
    var data = {
        userName : '用户名',
        passWord : '密码'
    }
    var data = validate(res,req,data);
    if(!data){
        return;
    }
    console.log(data);
    AV.User.logIn(data.userName, data.passWord).then(function (loginedUser) {
        console.log(loginedUser);
        var result = {
                    code : 200,
                    data : loginedUser,
                    message : '登录成功'
                }
                res.send(result);
      }, function (error) {
        var result = {
                    code : 500,
                    message : '登录失败'
                }
                res.send(result);
      });
})
//获取当前登录用户
router.get('/getUser', function(req, res, next) {
    var currentUser = AV.User.current();
      if (currentUser) {
        var result = {
            code : 200,
            data : currentUser,
            message : '用户已登录'
        }
        res.send(result);
      }
      else {
        var result = {
            code : 400,
            message : '用户未登录'
        }
        res.send(result);
      }
})
router.post('/m/signUp', function(req, res, next) {
    var data = {
        userName : '用户名',
        passWord : '密码',
    }
    var data = validate(res,req,data);
    if(!data){
        return;
    }
    console.log(data);
    var user = new AV.User();
    // 设置用户名
    user.setUsername(data.userName);
    // 设置密码
    user.setPassword(data.passWord);
    user.signUp().then(function (loginedUser) {
        // console.log(loginedUser);
        loginedUser.set('identity','管理员');
        loginedUser.save();
        var result = {
                    code : 200,
                    data : loginedUser,
                    message : '注册成功'
                }
            res.send(result);
        }, function (error) {
            console.log(error);
            var result = {
                code : 500,
                message : '保存出错'
            }
            res.send(result);

    });
})
router.post('/login', function(req, res, next) {
    var data = {
        userName : '用户名',
        passWord : '密码'
    }
    var data = validate(res,req,data);
    if(!data){
        return;
    }
    console.log(data);
    AV.User.logIn(data.userName, data.passWord).then(function (loginedUser) {
        console.log(loginedUser);
        var result = {
                    code : 200,
                    data : loginedUser,
                    message : '登录成功'
                }
                res.send(result);
      }, function (error) {
        var result = {
                    code : 500,
                    message : '登录失败'
                }
                res.send(result);
      });
})
module.exports = router;