/**
 * 账号管理登录注册弹窗
 */

import Vue from 'vue';
import $ from 'jquery';
import md5 from 'md5';

import {
    Dialog,
    Button,
    Tabs,
    Row,
    Col,
    Input,
    Popover,
}
from 'element-ui';
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);
Vue.use(Popover);

var com = {};
export default com;


//所有直接用到的组件在这里导入
com.props = {
    xid: {
        type: String,
        default: 'Profile',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from user/Login/Login.js',
        accInfo: ctx.$xglobal.accInfo,
        editMod: false,
        ipt: {},
        validates: {
            //input格式验证，fn或正则，和html的ref对应名称，通过时添加pass字段;注意method添加方法
            iptName: {
                fn: /^[\s\S]{2,18}$/,
                tip: '任意2～18位字符,请勿随意更改'
            },
        },
    };
};

com.methods = {
    validate: function (ref) {
        this.$xglobal.fns.validate(this, ref);
    },
    changeAvatar: async function () {
        var ctx = this;
        var opt = {
            accept: 'image/*',
            maxSize: 2048,
            success: async function (file) {
                //请求api保存个人头像信息
                var info = await saveProfile.call(ctx, {
                    avatar: file.url
                });
            },
        };
        var res = await ctx.$xglobal.fns.startUploadQn.call(ctx, opt);
    },
    updateProfile: async function () {
        var ctx = this;
        var info = await saveProfile.call(ctx, {
            name: ctx.$data.ipt.name,
        });
        ctx.$set(ctx.$data, 'editMod', false);
    },
    setEditMod: function () {
        var ctx = this;
        //将accInfo同步到编辑输入框,延迟避免validate异常
        for (var attr in ctx.$data.accInfo) {
            ctx.$set(ctx.$data.ipt, attr, 'xxx');
        };
        if (!ctx.$data.editMod) {
            setTimeout(function () {
                for (var attr in ctx.$data.accInfo) {
                    ctx.$set(ctx.$data.ipt, attr, ctx.$data.accInfo[attr]);
                };
                ctx.$set(ctx.$data, 'editMod', !ctx.$data.editMod);
            }, 200);
        } else {
            ctx.$set(ctx.$data, 'editMod', !ctx.$data.editMod);
        };
    },
};



//--------------------------functions---------------------------

/**
 * 设定用户资料（name域名，avatar头像等）
 */
async function saveProfile(info) {
    var ctx = this;
    try {
        var token = localStorage.getItem('accToken');
        if (!token) {
            ctx.$notify.error({
                title: `您还没有登录，请先登录或注册`,
                message: '只有登录成功后才能修改资料',
            });
            return;
        };

        var api = ctx.$xglobal.conf.apis.accSaveProfile;
        var data = {
            token: token,
        };
        data = Object.assign(data, info || {});

        var res = await ctx.rRun(api, data);

        if (!res.err) {
            ctx.$notify.success({
                title: '保存成功!',
            });

            //更新$xglobal.accInfo
            ctx.$xglobal.accInfo = res.data;
            ctx.$set(ctx.$data, 'accInfo', res.data);
        };
    } catch (err) {
        ctx.$notify.error({
            title: `保存失败`,
            message: err.tip,
        });
    };
};




//
