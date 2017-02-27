/*全局函数文件，将被xglobal插件载入到每个component的this.$xglobal.fns备用
 */
import $ from 'jquery';
import Vue from 'vue';
import {
    Dialog,
    Notification,
    MessageBox,
}
from 'element-ui'
Vue.use(Dialog);
const notify = Notification
Vue.prototype.$notify = notify;
const confirm = MessageBox.confirm;
Vue.prototype.$confirm = confirm;
const ealert = MessageBox.alert;
Vue.prototype.$alert = ealert;


let fns = {
    getCookie,
    validate,
    autoLogin,
    showFullMask,
    visualClick,
    sleep,
    startUploadQn,
};
export default fns;


//------------------functions------------
/**
 * 自动登录，使用token
 */
async function autoLogin(ctx) {
    try {
        var token = localStorage.getItem('accToken');
        if (!token) {
            ctx.$notify.error({
                title: `您还没有登录，请先登录或注册`,
                message: '登录后可以获得更多功能',
            });
            return;
        };

        var api = ctx.$xglobal.conf.apis.accAutoLogin;
        var data = {
            token: token,
        };
        var res = await ctx.rRun(api, data);

        if (!res.err) {
            ctx.$notify.success({
                title: '自动登录成功!',
            });

            //数据放入xglobal
            ctx.$set(ctx.$xglobal, 'accInfo', res.data);
        };
    } catch (err) {
        if (!ctx.$notify) return;
        ctx.$notify.error({
            title: `自动登录失败，请尝试使用密码登录`,
            message: err.tip,
        });
    };
};

/**
 * 从本地读取cookie
 * @param   {string}   cookieName key键名
 * @returns {string} value
 */
function getCookie(cookieName) {
    var arr = document.cookie.match(new RegExp("(?:^| )" + cookieName + "=([^;]*)(;|$)"));
    if (arr != null) return unescape(arr[1]);
    return null;
};

/**
 * 扩展JSON安全parse方法
 * @param   {string} str 字符串
 * @returns {object} 成功的对象或undefined
 */
JSON.safeParse = function (str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return undefined;
    };
};

/**
 * 对el包裹的input事件进行验证，在el-input上使用;验证通过将在vali对象上添加字段pass
 * <el-input ref='regMobile' @change='validate("regMobile")'>
 * @param {object} evt event
 * @returns {boolean} 通过验证为true
 */
function validate(ctx, ref) {
    var vali = ctx.$data.validates ? ctx.$data.validates[ref] : undefined;
    if (!vali) return;
    var fn = vali ? vali.fn : undefined;
    if (!fn) return;

    var jo = $(ctx.$refs[ref].$el);
    var type = fn.constructor;
    var iptjo = jo.find('input');
    var val = iptjo.val();
    var tipjo = $('<div id="valiTip" style="font-size:10px;color:red;text-align:left"></div>');
    var tip = vali ? vali.tip : '您输入的格式不完整或不正确';
    tipjo.html(tip);

    if ((type == Function && fn(val)) || (type == RegExp && fn.test(String(val)))) {
        ctx.$set(ctx.$data.validates[ref], 'pass', true);
        jo.find('#valiTip').remove();
        iptjo.css('color', 'inherit');
        return true;
    } else {
        ctx.$set(ctx.$data.validates[ref], 'pass', false);
        iptjo.css('color', 'red');
        jo.find('#valiTip').remove();
        jo.append(tipjo);
        return false;
    };
};


/**
 * 暂停时间，返回promise
 * @param {number} msec 毫秒数
 */
async function sleep(msec) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(msec);
            return msec;
        }, msec);
    });
};


/**
 * 禁用全屏幕，body添加全屏幕mask
 * @param {boolean} enable 是否显示mask，默认为true显示
 */
function showFullMask(enable = true) {
    var jo = $('#_fullPageMask');
    if (!jo[0]) jo = genFullPageMask();

    if (enable) {
        jo.show();
        jo.find('#bg').show();
    } else {
        jo.hide();
    };
};



/**
 * 模拟点击按钮并显示鼠标点击的视觉效果，显示在_fullPageMask
 * 如果useBg==false，那么需要手工处理延迟，使用sleep(500);
 * @param {object}   joOrId    被点击的对象或其id字符串
 * @param {boolean} useBg  是否使用背景禁止鼠标事件,如果不使用就动画后自动隐藏整个遮罩
 */
function visualClick(joOrId, useBg, notclick) {
    var jo = joOrId.constructor == String ? $('#' + joOrId) : joOrId;

    //获取定位，创建圆圈
    var visualJo = $('<div></div>');
    var posx = jo.offset().left + jo.outerWidth() / 2 - 50;
    var posy = jo.offset().top + jo.outerHeight() / 2 - 50;
    visualJo.css({
        position: 'absolute',
        top: posy + 'px',
        left: posx + 'px',
        width: '100px',
        height: '100px',
        'border-radius': '100px',
    });

    var cursorJo = $('<div id="cursor"></div>');
    cursorJo.css({
        position: 'relative',
        left: '50px',
        top: '50px',
        width: '0px',
        height: '0px',
        'border-radius': '100px',
        background: '#e91e63',
        opacity: '0.5',
    });
    visualJo.append(cursorJo);

    //如果没有容器就创建，容器内添加bg遮罩元素
    var containerJo = $('#_fullPageMask');
    if (!containerJo[0]) containerJo = genFullPageMask();

    //是否使用遮罩
    containerJo.show();
    if (useBg) {
        containerJo.find('#bg').show();
    } else {
        containerJo.find('#bg').hide();
    };

    //添加，500毫秒后消失
    containerJo.append(visualJo);
    cursorJo.animate({
        left: '0',
        top: '0',
        height: '100px',
        width: '100px'
    }, 300);


    setTimeout(function () {
        visualJo.remove();
        //执行点击
        if (!notclick) jo.click();
    }, 300);

    //如果不使用背景，点击后就隐藏全屏遮盖
    if (!useBg) {
        clearTimeout(containerJo.attr('hideTimerId'));
        var hideTimerId = setTimeout(function () {
            containerJo.hide();
        }, 300);
        containerJo.attr('hideTimerId', hideTimerId);
    };

    return jo;
};

/**
 * 产生带遮罩的全屏_fullPageMask，里面包含一个bg遮罩
 * @returns {object} jo
 */
function genFullPageMask() {
    var jo;
    jo = $('<div id="_fullPageMask" ></div>');
    jo.css({
        position: 'absolute',
        'z-index': '10000',
        width: '100%',
        height: '100%',
    });
    var bgJo = $('<div id="bg"></div>');
    bgJo.css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: '0.05',
        background: '#1cbbb4',
    });
    bgJo.hide();
    jo.append(bgJo);
    $('body').append(jo);
    return jo;
};

/**
 * 选择一个文件上传,自动向#uploadIptBox元素添加一个input并click它
 * opt:{maxSize,success(res),fileName,tag};
 */
async function startUploadQn(opt) {
    var ctx = this;
    var iptBox = $('body').find('#uploadIptBox');
    if (!iptBox[0]) $('body').append($('<div id="uploadIptBox" style="display:none"></div>'))
    iptBox.empty();
    var accept = (opt && opt.accept) ? opt.accept : "*";

    var iptJo = $(`<input type="file" accept="${accept}">`);
    iptJo.change(function (evt) {
        uploadIptChanged.call(ctx, evt, opt);
    });
    iptBox.append(iptJo);
    iptJo.click();
};

/**
 * 监听隐身上传按钮，过滤限制，启动上传一个文件
 * @param   {object}   evt evt
 * @param   {object}   opt opt
 */
async function uploadIptChanged(evt, opt) {
    var ctx = this;
    var file = evt.target.files[0];
    if (!file) return;

    var maxSize = (opt && opt.maxSize) ? opt.maxSize : 2048;

    //限制上传文件最大1M
    if (file.size / 1024 > maxSize) {
        ctx.$notify.error({
            title: `上传失败，文件大小超过限制`,
            message: `单个文件上传最大不超过${maxSize}k`,
        });
        return;
    };

    var tag = (opt && opt.tag) ? opt.tag : 'none';
    var fileName = (opt && opt.fileName) ? opt.fileName : file.name;

    var res = await uploadFile.call(ctx, tag, fileName, file);

    if (opt && opt.success) {
        await opt.success.call(ctx, res);
    } else {
        ctx.$alert(res.url, '上传成功，请复制下面的链接', {
            confirmButtonText: '确定'
        });
    };
};

/**
 * 获取token并上传文件
 * @param   {string} tag      上传标记，参照后端qn设置,none,share,page;自动为page添加pageId
 * @param   {string} fileName 指定文件名,url格式app.10knet.com/randkey/filename
 * @param   {string} file     上传的文件对象或者blob
 * @returns {object} token接口和upload接口两次数据的合并结果
 */
async function uploadFile(tag, fileName, file) {
    var ctx = this;
    try {
        //获取随机key的token
        var tokenApi = ctx.$xglobal.conf.apis.qnRandKeyUploadToken;
        var data = {
            token: localStorage.getItem('accToken'),
            tag: tag ? tag : 'none',
            fileName: fileName ? fileName : "untitled",
        };

        //如果accPage本地不为空，那么附带pageId
        var aPage = JSON.safeParse(localStorage.getItem('accPage'));

        var pageId = aPage ? aPage._id : undefined;
        if (tag == 'page' && pageId) {
            data.pageId = pageId;
        };

        var tokenRes = await ctx.rRun(tokenApi, data);

        var token = tokenRes.data.token;

        //使用token上传文件
        var formdata = new FormData();
        formdata.append('file', file);
        formdata.append('token', tokenRes.data.token);
        formdata.append('key', tokenRes.data.key);

        var uploadRes = await ctx.rRun({
            url: "http://up.qiniu.com",
            data: formdata,
            type: 'POST',
            processData: false,
            contentType: false,
        });

        var fileInfo = Object.assign({
            file: file
        }, uploadRes.data, tokenRes.data);

        return fileInfo;

    } catch (err) {
        ctx.$notify.error({
            title: `上传页面文件失败`,
            message: err.tip || err.message || '原因未知',
        });
    }
};





//
