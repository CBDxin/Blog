let express = require('express');
let router = express.Router();
let Category = require('../models/Category');
let Content = require('../models/Content');
let Pyq = require('../models/Pyq');



router.get('/',(req,res)=>{
    let limit = 5;
    let pages = 1;
    let page = 1;
    let count = 0;
    let skip = 0;
    let cateId;
    let where= {};
    let cateName;
    cateId = req.query.cateId || '';
    if(cateId){
        where.category =cateId;
    }
    Category.find().sort({_id:1}).then((category)=>{
        Content.where(where).count().then((result)=>{
            cateName = req.query.cateName || '';
            count = result;
            page = Number(req.query.page || 1);
            pages = Math.ceil(count/limit);
            page = Math.max(1,page);
            page = Math.min(pages,page);
            skip = Math.max((page-1)*limit,0);

            Content.where(where).find().sort({_id:-1}).skip(skip).limit(limit).populate(['category','writer']).then((content)=>{
                res.render('main/index',{
                    cateId:cateId,

                    userInfo:req.userInfo,
                    content:content,
                    pages:pages,
                    page:page,
                    category:category,
                    count:count,
                    cateName:cateName
                })

            });});
    });


});
router.get('/pyq',(req,res)=>{
    let limit = 5;
    let pages = 1;
    let page = 1;
    let count = 0;
    let skip = 0;
    let cateId;
    let where= {};
    let cateName;

        Pyq.count().then((result)=>{
            cateName = req.query.cateName || '';
            count = result;
            page = Number(req.query.page || 1);
            pages = Math.ceil(count/limit);
            page = Math.max(1,page);
            page = Math.min(pages,page);
            skip = Math.max((page-1)*limit,0);

            Pyq.find().sort({_id:-1}).skip(skip).limit(limit).populate(['writer']).then((content)=>{
                res.render('main/pyqindex',{


                    userInfo:req.userInfo,
                    content:content,
                    pages:pages,
                    page:page,
                    count:count,
                })

            });});



});
router.get('/content',(req,res)=>{
    Category.find().sort({_id:1}).then((category)=>{
        console.log(category);
        res.render('main/content_add', {
            userInfo: req.userInfo,
            category:category
        });
    });
});
router.get('/putpyq',(req,res)=>{
    if(req.userInfo){
        res.render('main/pyq_add', {
            userInfo: req.userInfo,

        });
    }else {
        res.render('main/error',{
            message:"请先登录"
        })
    }


});
router.get('/test',(req,res)=>{
    res.render('test/index')

});
router.post('/content',(req,res)=>{
    let category = req.body.category || '';
    let title = req.body.title || '';
    let description = req.body.description || '';
    let content = req.body.editorValue || '';
    if( title == ''){
        res.render('main/error',{
            userInfo:req.userInfo,
            message:"标题不能为空"
        })
        return;
    }
    if( description == ''){
        res.render('main/error',{
            userInfo:req.userInfo,
            message:"简介不能为空"
        })
        return;
    }
    if( content == ''){
        res.render('main/error',{
            userInfo:req.userInfo,
            message:"内容不能为空"
        })
        return;
    }
    new Content({
        category:category,
        title:title,
        description:description,
        content:content,
        writer:req.userInfo._id
    }).save().then((rs)=>{

            res.render('main/success',{
                userInfo:req.userInfo,
                message:"发布成功",
                url:'/'
            });

    });
});
router.post('/putpyq',(req,res)=>{
    let content = req.body.pyqcontent || '';
    new Pyq({
        content:content,
        writer:req.userInfo._id
    }).save().then(()=>{
        res.render('main/success',{
            message:"发布成功",
            url:"/"
        })
    });
})
router.get('/view',(req,res)=>{
    let id = req.query.id || '';
    Category.find().sort({_id:1}).then((category)=>{
        Content.findOne({
            _id:id
        }).populate(['catehory','writer']).then((content)=>{
            content.views++;
            content.save().then(()=>{
                res.render('main/view',{
                    userInfo:req.userInfo,
                    content:content,
                    category:category
                })
            });
        });
    });

});
router.get('/Snake',(req,res)=>{
   res.render('main/snake');
});


module.exports = router;