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
        default: 'Login',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from user/Login/Login.js',
        ipt: {},
        validates: {
            //input格式验证，fn或正则，和html的ref对应名称，通过时添加pass字段;注意method添加方法
            loginMobile: {
                fn: /^1\d{10}$/,
                tip: '真实的11位数字手机号码'
            },
            loginPw: {
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
    mobileLogin: async function () {
        var ctx = this;
        try {
            var api = ctx.$xglobal.conf.apis.accLogin;
            var data = {
                mobile: ctx.$data.ipt.mobile,
                pw: md5(ctx.$data.ipt.pw),
            };
            var res = await ctx.rRun(api, data);

            if (!res.err) {
                ctx.$notify.success({
                    title: '登录成功!',
                });

                //数据放入xglobal
                ctx.$set(ctx.$xglobal, 'accInfo', res.data);

                //token写入本地
                localStorage.setItem('accToken', res.data._token);

                //??成功后处理

            };
        } catch (err) {
            console.log('err', err);
            ctx.$notify.error({
                title: `登录失败`,
                message: err.tip || err.message,
            });
        };
    },
}


//--------------------------functions---------------------------
