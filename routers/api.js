let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Content = require('../models/Content');
const crypto = require('crypto');

let responseData;

router.use((res,req,next)=>{
    responseData = {
        code:0,
        message:''
    }
    next();
});

router.post('/user/register',(req,res,next)=>{
    let username = req.body.username;
    let password = req.body.password;
    let repassword = req.body.repassword;
    //用户名不为空
    if(username === ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    //密码不为空
    if( password === ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    //两次密码一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次密码必须一致!';
        res.json(responseData);
        return;
    }
    //用户名是否已存在
    User.findOne({
        username:username
    }).then((userInfo)=>{
        if(userInfo){
            responseData.code = 4;
            responseData.message = '用户名已存在';
            res.json(responseData);
            return;
        }
        password = crypto.createHmac('sha256', password)
            .update('juju')
            .digest('hex');
        let user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then((newUserInfo)=>{
        console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    });
});
router.post('/user/login',(req,res,next)=>{
    let username = req.body.username;
    let password = req.body.password;

    if(username == ''|| password == ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    password = crypto.createHmac('sha256', password)
        .update('juju')
        .digest('hex');
    User.findOne({
        username:username,
        password:password
    }).then((userInfo)=>{
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名不存在或密码错误';
            res.json(responseData);
            return
        }
        responseData.message = '登录成功';
        responseData.userInfo={
            _id:userInfo._id,
            username:userInfo.username
        }

        req.session.userInfo = {
            _id:userInfo._id
        };


        res.json(responseData);
        return;
    })
});
router.get('/user/logout',(req,res,)=>{
    req.session.userInfo = null;
    res.json(responseData);
});

router.get('/comment',(req,res)=>{
    let contentId = req.query.id || '';

    Content.findOne({
        _id:contentId
    }).then((content)=>{
        responseData.data = content.comments;
        res.json(responseData);
    });
});

router.post('/comment/post',(req,res)=>{

   let contentId = req.body.id || '';

   let postDate ={
       username: req.userInfo.username,
       postTime: Date(Date.now()),
       content: req.body.content
   }
    console.log(postDate);
   Content.findOne({
      _id:contentId
   }).then((content)=>{
       content.comments.unshift(postDate);
       return content.save();
   }).then((rs)=>{
      responseData.message = '评论成功';
      responseData.data = rs;
      res.json(responseData);
   });
});

module.exports = router;
