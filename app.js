//入口文件
let express = require('express');
let swig = require('swig');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let path = require('path');
let session = require('express-session');
let User = require('./models/User');

let app = express();

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));

app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 60* 24 * 7, // 设置 session 的有效时间，单位毫秒
    },
}));

app.use('/public',express.static(__dirname + '/public'));
app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');
swig.setDefaults({cache:false});

app.use((req,res,next)=>{

    if(req.session.userInfo){
        try {
            req.userInfo = req.session.userInfo;

            User.findById(req.userInfo._id).then((userInfo)=>{
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                req.userInfo.username = userInfo.username;
                next();
                /*return User.findOne({
                    _id: req.userInfo._id
                }).then((result)=>{
                    req.userInfo.username = result.username;
                    next();
                })*/
            })
        }catch (e){ }

    }else {
        next();
    }

})

//加载ueditor 模块
var ueditor = require("ueditor");

//使用模块
app.use("/public/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;

        var imgname = req.ueditor.filename;

        var img_url = '/images/ueditor/';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');//IE8下载需要设置返回头尾text/html 不然json返回文件会被直接下载打开
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/public/images/ueditor/';
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/public/ueditor/jsp/config.json');
    }
}));







//划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


mongoose.connect('mongodb://127.0.0.1:27017/blog',(err)=>{
    if(err){
        console.log("数据库连接失败。");
    }else{
        console.log("数据库连接成功！");
        app.listen(3000);
    }
})

