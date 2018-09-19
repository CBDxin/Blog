let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Category = require('../models/Category');
let Content = require('../models/Content');

router.use((req,res,next)=>{
   if(!req.userInfo.isAdmin) {
       res.render('admin/NotAdmin',{
           userInfo:req.userInfo

       })
       return;
   }
   next();
});

router.get('/',(req,res,next)=>{
    res.render('admin/admin_index',{
        userInfo:req.userInfo
    });
});
//用户管理
router.get('/user',(req,res)=>{
let limit = 10;
let pages = 1;
let page = 1;
let count = 0;
let skip = 0;

User.count().then((result)=>{
    count = result;
    page = Number(req.query.page || 1);
    pages = Math.ceil(count/limit);
    page = Math.max(1,page);
    page = Math.min(pages,page);
    skip = (page-1)*limit;
    User.find().sort({username:1}).skip(skip).limit(limit).then((users)=>{

            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                pages:pages,
                page:page,
                count:count
            })

    });});
});

router.get('/category',(req,res)=>{
    let limit = 10;
    let pages = 1;
    let page = 1;
    let count = 0;
    let skip = 0;

    Category.count().then((result)=>{
        count = result;
        page = Number(req.query.page || 1);
        pages = Math.ceil(count/limit);
        page = Math.max(1,page);
        page = Math.min(pages,page);
        skip = (page-1)*limit;
        Category.find().sort({_id:-1}).skip(skip).limit(limit).then((category)=>{

            res.render('admin/category_index',{
                userInfo:req.userInfo,
                category:category,
                pages:pages,
                page:page,
                count:count
            })

        });});
});
router.get('/category/add',(req,res,next)=>{
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});
router.post('/category/add',(req,res,next)=>{
   let name = req.body.name || '';
   if(name == ''){
       res.render('admin/error',{
           userInfo:req.userInfo,
           message:"名称不能为空"
       });
       return
   }
   Category.findOne({
       name:name
   }).then((rs)=>{
       if(rs){
           res.render('admin/error',{
               userInfo:req.userInfo,
               message:"该分类已经存在"
           });
           return Promise.reject();
       }else{
           return new Category({
               name:name
           }).save()
       }
   }).then((newrs)=>{
       res.render('admin/success',{
           userInfo:req.userInfo,
           message:'添加成功',
           url:'/admin/category'
       });
   })
});
//分类修改
router.get('/category/edit',(req,res)=>{
   let id = req.query.id || '';
   Category.findOne({
       _id:id
   }).then((rs)=>{
       if(!rs){
           res.render('admin/error',{
               userInfo:req.userInfo,
               message:'分类信息不存在'
           });
           return
       }else {
           res.render('admin/category_edit',{
               userInfo:req.userInfo,
               category:rs
           });
       }
   })
});
//分类保存
router.post('/category/edit',(req,res)=>{
    let id = req.query.id || '';
    let name = req.body.name;
    Category.findOne({
        _id:id
    }).then((rs)=>{
        if(!rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return
        }else {
            if( name == ''){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'分类名称不能为空'
                });
                return;
            }
            if( name == rs.name ){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return;
            }else {
                Category.findOne({
                    _id:{$ne: id},
                    name:name
                }).then((rs)=>{
                    if(rs){
                        res.render('admin/error',{
                            userInfo:req.userInfo,
                            message:'该分类名称已存在'
                        });
                        return
                    }else{
                        Category.update({
                            _id:id
                        },{
                            name:name
                        }).then(()=>{
                            res.render('admin/success',{
                                userInfo:req.userInfo,
                                message:'修改成功',
                                url:'/admin/category'
                            });
                            return;
                        })
                    }
                })
            }
        }
    })
});
//分类删除
router.get('/category/delete',(req,res)=>{
   let id =req.query.id || '';
   Category.remove({
       _id:id
   }).then(()=>{
       res.render('admin/success',{
           userInfo:req.userInfo,
           message:'删除成功',
           url:'/admin/category'
       });
   })
});

router.get('/content',(req,res)=>{
    let limit = 10;
    let pages = 1;
    let page = 1;
    let count = 0;
    let skip = 0;

    Content.count().then((result)=>{
        count = result;
        page = Number(req.query.page || 1);
        pages = Math.ceil(count/limit);
        page = Math.max(1,page);
        page = Math.min(pages,page);
        skip = Math.max((page-1)*limit,0);
        Content.find().sort({_id:-1}).skip(skip).limit(limit).populate(['category','writer']).then((content)=>{
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                content:content,
                pages:pages,
                page:page,
                count:count
            })

        });});
});
router.get('/content/delete',(req,res)=>{
    let id =req.query.id || '';
    Content.remove({
        _id:id
    }).then(()=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        });
    })
});
module.exports = router;