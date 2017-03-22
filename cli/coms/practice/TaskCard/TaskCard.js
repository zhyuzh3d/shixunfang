import Vue from 'vue'
import $ from 'jquery';
var com = {};
export default com;

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
const confirm = MessageBox.confirm;
Vue.prototype.$confirm = confirm;

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
    submit,
};

com.mounted = function () {
    var ctx = this;
};



//----------------------------functions----------------------
/**
 * 提交任务请求审核
 */
async function submit() {
    var ctx = this;
    try {

        var api = ctx.$xglobal.conf.apis.chckSubmit;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.fill._id,
            planId: ctx.fill.plan._id,
        };
        var res = await ctx.rRun(api, data);

        //更新check的数据
        var check = Object.assign(ctx.fill.check || {}, res.data);
        ctx.$set(ctx.fill, 'check', check);
        ctx.$set(ctx.fill, 'show', true); //保持显示，暂不清理

    } catch (err) {
        ctx.$notify.error({
            title: '提交失败',
            message: err.tip || err.message,
        });
    }
};









//
