
$(window).scroll(()=>{
    if($(window).scrollTop()>=350){
        $('.my-navbar').addClass('become-black');
    }else {
        $('.my-navbar').removeClass('become-black');
    }
});
$('.login-box .rs').click(()=>{
    $('.login-box').hide();
    $('.register-box').show();
});
$('.register-box .lg').click(()=>{
    $('.login-box').show();
    $('.register-box').hide();
});
$('.register-box .btn').on('click',()=>{
    $.ajax({
        type:'post',
        url: 'api/user/register',
        data:{
            username:$('.register-box .username').val(),
            password:$('.register-box .password').val(),
            repassword:$('.register-box .repassword').val()
        },
        dataType:'json',
        success:(result)=>{
            $(".register-box .warning-word").html(result.message);
            $('.register-box .password').val('');
            $('.register-box .repassword').val('');
            if(!result.code){
                $('.register-box .warning-word').html('');
                $('.register-box .succee-word').html(result.message);
                setTimeout(()=>{
                    $('.login-box').show();
                    $('.register-box').hide();
                    $('.register-box .username').val('');
                    $('.login-box .password').val('');
                    $('.login-box .repassword').val('');
                    $('.register-box .succee-word').html('');
                },1000);
            }

        }
    })
})
$('.login-box .btn').on('click',()=>{
    $.ajax({
        type:'post',
        url: 'api/user/login',
        data:{
            username:$('.login-box .username').val(),
            password:$('.login-box .password').val(),
        },
        dataType:'json',
        success:(result)=>{
            $(".login-box .warning-word").html(result.message);

            if(!result.code){
                $('.login-box .warning-word').html('');
                $('.login-box .succee-word').html(result.message);
                setTimeout(()=>{
                    window.location.reload();
                    $('.login-box .username').val('');
                    $('.login-box .password').val('');
                    $('.login-box .succee-word').html('');
                    $('.user-info small').html(result.userInfo.username)
                },1000);
            }

        }
    })
});
$('.user-info .logout').on('click',()=>{
    $.ajax({
        url:'/api/user/logout',
        success:(result)=>{
            if(!result.code)
            window.location.reload();
        }
    });
})

let perpage =5;
let page =1;
let pages = 1;
let comment = [];

$('#messageBtn').on('click',()=>{
   $.ajax({
       type:'post',
       url:'/api/comment/post',
       data:{
           id:$('#hidden').val(),
           content:$('#messageContent').val()
    },
    success:(responseData)=>{
        $('#messageContent').val('');
        comment = responseData.data.comments;
        rs();
    }

   }) ;

});
$.ajax({
    url:'/api/comment',
    data:{
        id:$('#hidden').val()
    },
    success:(responseData)=>{
        comment = responseData.data;
        rs();
    }
});
$('.pager').delegate('.previous a','click',()=>{
    page--;
    rs();
})
$('.pager').delegate('.next a','click',()=>{
    page++;
    rs();
})


function rs() {
    console.log(comment);
    let star = (page-1)*perpage;
    let end = Math.min(star+perpage,comment.length);
    pages = Math.ceil(comment.length/perpage);
    $('#com-num').html(comment.length);
    $('.com-fenye .page').html(page);
    $('.com-fenye .pages').html(pages);
    let html = '';
    if(page<=1){
        page=1;
        $('.com-fenye .previous').html('<span>没有上一页了</span>')
    }else {
        $('.com-fenye .previous').html('<a href="javascript:;"><span aria-hidden="true">&larr;</span> 上一页</a>')
    }
    if(page>=pages){
        page=pages;
        $('.com-fenye .next').html('<span>没有下一页了</span>')
    }else {
        $('.com-fenye .next').html('<a href="javascript:;">下一页 <span aria-hidden="true">&rarr;</span></a>')
    }

    for (let i=star;i<end;i++){
            html += '<h3 class="w60" ><strong>'+comment[i].username+'</strong><small class="em right">'
            +formatDate(comment[i].postTime)+'</small></h3>'
            +'<h4>'+comment[i].content+'</h4>';
    }
    $('#com-footer').html(html);
}
function formatDate(d) {
    let date = new Date(d);
    return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'+' '+date.getHours()+':'
    +date.getMinutes()+":"+date.getSeconds();
}