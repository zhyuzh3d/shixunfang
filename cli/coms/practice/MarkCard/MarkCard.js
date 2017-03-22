import Vue from 'vue'
import $ from 'jquery';
var com = {};
export default com;

import Moment from 'moment';
Moment.locale('zh-cn');

import {
    Dialog,
    Button,
    Row,
    Col,
    Notification,
    MessageBox,
    Tooltip
}
from 'element-ui'
Vue.use(Tooltip);
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Row);
Vue.use(Col);
const notify = Notification
Vue.prototype.$notify = notify;
const prompt = MessageBox.prompt;
Vue.prototype.$prompt = prompt;

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from paractice/TaskCard/TaskCard.js',
    };
};

com.props = {
    fill: {
        type: Object,
    },
    index: Number,
};

com.methods = {
    Moment,
    setPass,
    setReject,
};

com.mounted = function () {
    var ctx = this;
};



//----------------------------functions----------------------
/**
 * 通过审阅;先弹窗输入评语
 */
async function setPass() {
    var ctx = this;
    var ipt;
    try {
        ipt = await ctx.$prompt('请输入评语', '通过审阅', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^[\S\s]{0,256}$/,
            inputErrorMessage: '评语不能超过256个字符'
        });

        var api = ctx.$xglobal.conf.apis.mrkSetPass;
        var data = {
            token: localStorage.getItem('accToken'),
            comment: ipt.value,
            _id: ctx.fill._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.fill, 'state', 'marked');
        ctx.$set(ctx.fill, 'pass', true);
    } catch (err) {
        if (ipt === undefined) return;
        ctx.$notify.error({
            title: '修改失败',
            message: err.tip || err.message,
        });
    };
};
/**
 * 驳回审阅;先弹窗输入不少于12个字符的评语
 */
async function setReject() {
    var ctx = this;
    var ipt;
    try {
        ipt = await ctx.$prompt('请输入评语', '通过审阅', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^[\S\s]{12,256}$/,
            inputErrorMessage: '评语不能少于12个字符，不能超过256个字符'
        });

        var api = ctx.$xglobal.conf.apis.mrkSetReject;
        var data = {
            token: localStorage.getItem('accToken'),
            comment: ipt.value,
            _id: ctx.fill._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.fill, 'state', 'marked');
        ctx.$set(ctx.fill, 'pass', false);
    } catch (err) {
        if (ipt === undefined) return;
        ctx.$notify.error({
            title: '修改失败',
            message: err.tip || err.message,
        });
    };
};









//
