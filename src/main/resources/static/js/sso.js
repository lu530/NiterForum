aqq=null;
aweibo=null;
var auths = {};
function getService(){
    plus.oauth.getServices(function(services){
        for(var i in services){
            auths[services[i].id]=services[i];
            //alert(services[i].id);
        }
        aqq = auths['qq'];
        aweibo=auths['sinaweibo'];
        //var aaa='qq';
        //alert("6666"+auths[aaa].id);
        authLogout();
    }, function(e){
        plus.nativeUI.alert("获取登录授权服务列表失败："+JSON.stringify(e));
    } );
}

function authorize(){
    if(!aqq.id){
        alert("当前环境不支持qq登录");
        plus.nativeUI.alert("当前环境不支持qq登录");
        return;
    }
    aqq.authorize(function(e){
        alert("授权成功："+JSON.stringify(e));
        plus.nativeUI.alert("授权成功："+JSON.stringify(e));
    }, function(e){
        alert("授权失败："+JSON.stringify(e));
        plus.nativeUI.alert("授权失败："+JSON.stringify(e));
    }, {scope:'get_user_info',state:'1',appid:'101859689',redirect_url:'https://niter.cn/callbackqq'});
    alert("222");
}

function authLoginQq(){
    if(!aqq){
        plus.nativeUI.alert("当前环境不支持QQ登录");
        return;
    }
    if(!aqq.authResult){
        aqq.login(function(e){
            //plus.nativeUI.alert("登录认证成功!");
            aqq.getUserInfo( function(e){
                queryServer('qq');
            }, function(e){
                plus.nativeUI.alert("获取用户信息失败： "+JSON.stringify(e));
            } );
        }, function(e){
            plus.nativeUI.alert("登录认证失败: "+JSON.stringify(e));
        },{scope:'get_user_info',state:'1',appid:'101859689',redirect_url:'https://niter.cn/callbackqq'});
    }else{
        //plus.nativeUI.alert("已经登录认证!");
        queryServer('qq');
    }
}
function authLoginWeibo(){
    if(!aweibo){
        plus.nativeUI.alert("当前环境不支持微博登录");
        return;
    }
    if(!aweibo.authResult){
        aweibo.login(function(e){
            //plus.nativeUI.alert("登录认证成功!");
            aweibo.getUserInfo( function(e){
                queryServer('weibo');
            }, function(e){
                plus.nativeUI.alert("获取用户信息失败： "+JSON.stringify(e));
            } );

            //authLogout();
        }, function(e){
            plus.nativeUI.alert("登录认证失败: "+JSON.stringify(e));
        },{scope:'all',state:'1',appid:'2346150891',redirect_url:'https://niter.cn/callbackweibo'});
    }else{
        //plus.nativeUI.alert("已经登录认证!");
        queryServer('weibo');
    }
}

function authUserInfo(){
    if((!aqq)&&(!aweibo)){
        plus.nativeUI.alert("当前环境不支持qq与微博登录");
        return;
    }
    if(aqq.authResult){
        aqq.getUserInfo( function(e){
            // plus.nativeUI.alert("获取用户信息成功："+JSON.stringify(aqq.userInfo));
        }, function(e){
            plus.nativeUI.alert("获取用户信息失败： "+JSON.stringify(e));
        } );
    }else if(aweibo.authResult){
        aweibo.getUserInfo( function(e){
            // plus.nativeUI.alert("获取用户信息成功："+JSON.stringify(aweibo.userInfo));
        }, function(e){
            plus.nativeUI.alert("获取用户信息失败： "+JSON.stringify(e));
        } );
    }
    else {
        plus.nativeUI.alert("未登录认证!");
    }
}
function alertAuthService() {
    if(aqq){
        alert(JSON.stringify(aqq));
    }
    if(aweibo){
        alert(JSON.stringify(aweibo));
    }

}
function authLogout(){
    if((!aqq.authResult)&&(!aweibo.authResult)){
        //plus.nativeUI.alert("当前不需要退出");
        return;
    }
    if(aqq.authResult){
        aqq.logout(function(e){
            //plus.nativeUI.alert("注销登录认证成功!");
        }, function(e){
            //plus.nativeUI.alert("注销登录认证失败: "+JSON.stringify(e));
        });
    } else if(aweibo.authResult){
        aweibo.logout(function(e){
            //plus.nativeUI.alert("注销登录认证成功!");
        }, function(e){
            //plus.nativeUI.alert("注销登录认证失败: "+JSON.stringify(e));
        });
    }

}

function queryServer(service){
    if('weibo'==service) var sdata=JSON.stringify(aweibo);
    else if('qq'==service) var sdata=JSON.stringify(aqq);
    // alert("sdata"+sdata);
    $.ajax({
        type:"POST",
        url:"/api/oauthLogin",
        dataType:"json",
        contentType:"application/json",
        data:sdata,
        success:function(data){
            if(data.code==0){
                alert("错误："+data.msg);
            }
            else if(data.code==200){
                //alert(data.token);
                swal({
                    title: "恭喜您!",
                    text: ""+data.msg,
                    icon: "success",
                }).then((value) => {
                    window.location.href='/forum';
            });                }
            else alert("else:未知错误");
        },
        error:function(data){
            alert("error");
        }
    });
}

function plusReady(){
    getService();
    //authLogout();
}
if(window.plus){
    plusReady();
}else{
    document.addEventListener('plusready',plusReady,false);
}






var qrcodeStr = Math.random().toString(36).substr(2);
function alertQrcode() {
    swal({
        title: "请扫描此二维码，授权登录!",
        text: "请打开手机APP，扩展-扫描二维码，失效请刷新",
        icon: "https://www.zhihu.com/qrcode?url=https://niter.cn/sso/appConfirm?qrcodeStr="+qrcodeStr,
    });
    var QrInterValObj; //timer变量，控制时间
    var QrCount = 30; //间隔函数，2秒执行1次
    var QrCurCount;
    QrInterValObj = window.setInterval(SetQrRemainTime, 2000); //启动计时器，2秒执行一次
    function SetQrRemainTime() {
        if (QrCurCount == 1) {
            window.clearInterval(QrInterValObj);//停止计时器
        }
        else {
            QrCurCount--;
            $.ajax({
                type: "get",
                url: "/sso/appConfirmResult",
                ContentType: "application/json",
                CacheControl: "no-cache",
                data:{
                    qrcodeStr:qrcodeStr
                },
                //  dataType: "json",
                success: function(data) {
                    if(data.success==1){
                        window.location.href='/registerorLoginWithMailisOk?token='+data.token;
                    }
                },
                error: function(msg) {
                    console.log(msg)
                }
            })            }
    }
}

token = '';

userIp='';
function setType(a){
    ossType=a;
}
function login() {
    if($(".glyphicon-ok").hasClass("hide")) {
        swal({
            title: "哎哟...",
            text: "请先完成人机验证再提交哦~",
            icon: "error",
            button: "确认",
        });
    }else{
        if(ossType==1){//手机验证码登录
            registerOrLoginWithPhone();            }
        if(ossType==2){//登录邮箱
            registerOrLoginWithMail();            }
        if(ossType==3){//密码登录
            loginWithPW();            }
        if(ossType==4){//登录QQ
            window.location='https://graph.qq.com/oauth2.0/authorize?client_id=101797776&redirect_uri=' + document.location.origin + '/callbackqq&sresponse_type=code&state=1' ;
        }
        if(ossType==5){//登录百度
            window.location='https://openapi.baidu.com/oauth/2.0/authorize?client_id=OhHUeQ1wGTGC8AuZ9TX1A5IW&response_type=code&redirect_uri='+ document.location.origin +'/callbackbaidu&state=1' ;
        }
        if(ossType==6){//登录github
            window.location='https://github.com/login/oauth/authorize?client_id=b6ecb208ce93f679a75a&redirect_uri=' + document.location.origin + '/callback&scope=user&state=1' ;
        }

        if(ossType==8){//微博登录
            window.location='https://api.weibo.com/oauth2/authorize?client_id=4162907344&response_type=code&redirect_uri=' + document.location.origin + '/callbackweibo&scope=all&state=1' ;
        }
    }


}



isValid=1;//是否可以发送验证码
var InterValObj; //timer变量，控制时间
var count = 60; //间隔函数，1秒执行
var curCount;//当前剩余秒数
function getCode() {
    //console.log("token2:"+token);
    if (isValid == 0) {
        swal({
            title: "哎哟...",
            text: "您刚刚提交过了哦，请等待60s后再提交哦~",
            icon: "error",
            button: "确认",
        });
    }else if(token == ''||vaptchaObj6==null) {
        swal({
            title: "哎哟...",
            text: "请先完成人机验证再提交哦~",
            icon: "error",
            button: "确认",
        });
    } else {
        var username = $("#username").val();
        var mail = $("#mail").val();
        var reg = new RegExp("^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$");
        if(!reg.test(mail)){
            layer.msg("邮箱不合法");
            return false;
        }
        isValid == 0
        curCount = count;
        $("#btnSendCode").attr("disabled", "true");
        $("#btnSendCode").text(curCount + "秒后重新发送");
        $("#btnSendCode").removeAttr("onclick");
        InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次


        $.post('/mail/getMailCode', {
            mail:mail,
            username:username,
            token:token,
            ip:userIp
        }, function(result){
            if (result.code == 2030) {
                swal({
                    title: "哎哟...",
                    text: "" + result.message,
                    icon: "error",
                    button: "确认",
                });
            } else {
                sweetAlert("请耐心等待", ""+result.message, "info");
                $('#mail').attr("disabled", "disabled");

            }
        });
    }
}

function SetRemainTime() {
    if (curCount == 1) {
        isValid == 1
        window.clearInterval(InterValObj);//停止计时器
        $("#btnSendCode").removeAttr("disabled");//启用按钮
        $("#btnSendCode").attr("onclick","getCode();");
        $("#btnSendCode").text("获取验证码");
    }
    else {
        curCount--;
        $("#btnSendCode").text(curCount + "秒后重新发送");
    }
}

function registerOrLoginWithMail(){
    var verifyCode = $("#verifyCode").val();
    var mail = $("#mail").val();
    var pass = $("#pass").val();
    var repass = $("#repass").val();
    if(pass==null||repass==null) pass="null";
    else if(pass!=repass){
        swal("注册失败!", "两次密码不一致!", "warning");
        return false;
    }else if(pass.length<6||pass.length>16){
        swal("注册失败!", "当前密码长度不满足要求!", "warning");
        return false;
    }
    // if(verifyCode==sessionStorage.getItem("code")){//客户端第一次校验
    $.post('/api/sso/mail/registerOrLoginWithMail', {
        mail:mail,
        code:verifyCode,
        password:pass
    }, function(result){
        if (result.code == 200) {
            swal({
                title: "恭喜您!",
                text: "您已经成功登陆啦!",
                icon: "success",
            }).then((value) => {
                window.location.href='/forum';
        });
        } else {
            swal({
                title: "注册/登录失败!",
                text: ""+result.message,
                icon: "error",
                button: "确认",
            });
        }
    });

}

isValid=1;//是否可以发送验证码
var InterValObj; //timer变量，控制时间
var count = 60; //间隔函数，1秒执行
var curCount;//当前剩余秒数
function getPhoneCode() {
    var phone = $("#phone").val();{
        if(phone.length!=11||!(/^1[3456789]\d{9}$/.test(phone))){
            swal({
                title: "哎哟...",
                text: "手机号码有误，请重填",
                icon: "error",
                button: "确认",
            });
            return;
        }
    }
    if (isValid == 0) {
        swal({
            title: "哎哟...",
            text: "您刚刚提交过了哦，请等待60s后再提交哦~",
            icon: "error",
            button: "确认",
        });
    }else if(token == ''||vaptchaObj6==null) {
        swal({
            title: "哎哟...",
            text: "请先完成人机验证再提交哦~",
            icon: "error",
            button: "确认",
        });
    } else {
        isValid == 0
        curCount = count;
        $("#btnSendPhoneCode").attr("disabled", "true");
        $("#btnSendPhoneCode").text(curCount + "秒后重新发送");
        $("#btnSendPhoneCode").removeAttr("onclick");
        InterValObj = window.setInterval(SetRemainTimeforPhone, 1000); //启动计时器，1秒执行一次
        $.post('/phone/getPhoneCode', {
            phone:phone,
            token:token,
            ip:userIp
        }, function(result){
            if (result.code == 2032) {
                swal({
                    title: "哎哟，验证码发送失败",
                    text: "" + result.message,
                    icon: "error",
                    button: "确认",
                });
                //vaptchaObj.reset();
            } else {
                msg_id = result.message;
                sweetAlert("请耐心等待", "验证码已发送成功!", "info");
                $('#phone').attr("disabled", "disabled");

            }
        });
    }
}

function SetRemainTimeforPhone() {
    if (curCount == 1) {
        isValid == 1
        window.clearInterval(InterValObj);//停止计时器
        $("#btnSendPhoneCode").removeAttr("disabled");//启用按钮
        $("#btnSendPhoneCode").attr("onclick","getPhoneCode();");
        $("#btnSendPhoneCode").text("获取验证码");
    }
    else {
        curCount--;
        $("#btnSendPhoneCode").text(curCount + "秒后重新发送");
    }
}

function registerOrLoginWithPhone(){
    var verifyPhoneCode = $("#verifyPhoneCode").val();
    var phone = $("#phone").val();
    var pass = $("#pass").val();
    var repass = $("#repass").val();
    if(pass==null) pass="null";
    else if(pass!=repass){
        swal("注册失败!", "两次密码不一致!", "warning");
        return false;
    }else if(pass.length<6||pass.length>16){
        swal("注册失败!", "当前密码长度不满足要求!", "warning");
        return false;
    }
    // console.log("code:"+verifyPhoneCode+" msg_id:"+msg_id+" phone:"+phone)
    $.post('/phone/ValidCode', {
        msg_id:msg_id,
        code:verifyPhoneCode,
        phone:phone,
        state:2,
        password:pass
    }, function(result){
        if (result.code == 200) {
            swal({
                title: "恭喜您!",
                text: "您已经成功登陆啦!",
                icon: "success",
            }).then((value) => {
                window.location.href='/forum';
        });
        } else {
            swal({
                title: "注册/登录失败!",
                text: ""+result.message,
                icon: "error",
                button: "确认",
            });
        }
    });
}

function loginWithPW(){
    var phoneorMail = $("#phoneorMail").val();
    var password = $("#password").val();
    var type=1;//1为手机号，2为邮箱号
    if(password.length<6||password.length>16){
        swal("修改失败!", "当前密码长度不满足要求!", "warning");
        return false;
    }

    var mailReg = new RegExp("^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$");
    if((!mailReg.test(phoneorMail))){//邮箱不合法
        if(phoneorMail.length!=11||!(/^1[3456789]\d{9}$/.test(phoneorMail))){//手机不合法
            swal({
                title: "哎哟...",
                text: "你输入的手机号或者邮箱号有误，请重填",
                icon: "warning",
                button: "确认",
            });
            return;
        }

    }else {//邮箱合法
        type=2;
    }

    $.ajax({
        type:"POST",
        url:"/api/sso/login",
        data:{
            "name": phoneorMail
            ,"password":password
            ,"type":type
        },
        success:function(res){
            if(res.code==200) {
                swal({
                    title: "恭喜您!",
                    text: "您已经成功登陆啦!",
                    icon: "success",
                }).then((value) => {
                    window.location.href='/forum';
            });
            }
            else swal("Oh,no!", ""+res.message, "error");
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){
            swal(textStatus, "错误："+XMLHttpRequest.status, "error");
        }
    });
}

function imageValidate(){
    var mailCount = $("#phoneorMail").val();
    if(!mailCount){
        layer.alert("请填写邮箱号");
        return;
    }
    var urlPath = window.document.location.href;
    var docPath = window.document.location.pathname;
    var index = urlPath.indexOf(docPath);
    var serverPath = urlPath.substring(0, index);
    var index1 = layer.open({
        type: 2,
        area: ['750px', '550px'],
        fixed: false, //不固定
        maxmin: true,
        content: serverPath + '/imgValidate?email=' + mailCount
    });
}
