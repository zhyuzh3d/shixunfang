/**
 * 账号管理登录注册弹窗
 */

import Vue from 'vue';
import $ from 'jquery';
import md5 from 'md5';

import {
    Button,
    Tabs,
    Row,
    Col,
    Input,
}
from 'element-ui'
Vue.use(Button);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);

var com = {};
export default com;


//所有直接用到的组件在这里导入
com.components = {};

com.props = {
    xid: {
        type: String,
        default: 'Register',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from user/Register/Register.js',
        ipt: {
            codeBtnDis: false
        },
        validates: {
            //input格式验证，fn或正则，和html的ref对应名称，通过时添加pass字段;注意method添加方法
            regMobile: {
                fn: /^1\d{10}$/,
                tip: '真实的11位数字手机号码'
            },
            regCode: {
                fn: /^\d{6}$/,
                tip: '手机短信中的六位数字'
            },
            regPw: {
                fn: /^[\s\S]{6,18}$/,
                tip: '任意6～18位字符'
            },
        },
    };
};

com.methods = {
    validate: function (ref) {
        this.$xglobal.fns.validate(this, ref);
    },
    sendRegCode: async function () {
        var ctx = this;

        try {
            ctx.$set(ctx.$data.ipt, 'codeBtnDis', true);
            setTimeout(function () {
                ctx.$set(ctx.$data.ipt, 'codeBtnDis', false);
            }, 10000);

            var api = ctx.$xglobal.conf.apis.accGetMobileRegCode;
            var data = {
                mobile: ctx.$data.ipt.mobile,
            };
            var res = await ctx.rRun(api, data);
            if (!res.err) {
                ctx.$notify.success({
                    title: `验证码已经发送到您的手机，请查收`,
                    message: `手机号码是${data.mobile}`,
                });
            };
        } catch (err) {
            ctx.$notify.error({
                title: `发送重置验证码失败`,
                message: err.tip,
            });
        };
    },
    regByMobile: async function () {
        var ctx = this;
        try {
            var api = ctx.$xglobal.conf.apis.accRegByMobile;
            var data = {
                mobile: ctx.$data.ipt.mobile,
                code: ctx.$data.ipt.code,
                pw: md5(ctx.$data.ipt.pw),
            };
            var res = await ctx.rRun(api, data);

            if (!res.err) {
                ctx.$notify.success({
                    title: `恭喜您成为新用户！`,
                    message: '正在为您跳转',
                });

                //数据放入xglobal
                ctx.$set(ctx.$xglobal, 'accInfo', res.data);

                //跳转到UserHome
                await ctx.$xcoms['App_mainView-Tt'].$xgo({
                    homeView: 'UserHome',
                });

                //将token存到ls
                localStorage.setItem('accToken', res.data._token);
            };
        } catch (err) {
            ctx.$notify.error({
                title: `注册新用户失败`,
                message: err.tip || err.message,
            });
        };
    },
}


//--------------------------functions---------------------------
