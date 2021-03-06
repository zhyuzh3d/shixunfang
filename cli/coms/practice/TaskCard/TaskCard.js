//需要指定task.check和task.plan

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
    Tooltip,
    Input,
}
from 'element-ui'
Vue.use(Input);
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
        text: '',
        submitting: false,
        uploadPer: 0,
        textDialogVis: false,
        textDialogData: '',
        validates: {
            textDialogDesc: {
                fn: /^[\s\S]{1,4096}$/,
                tip: '不超过2048字符'
            },
        },
    };
};

com.props = {
    fill: {
        type: Object,
    },
    index: Number,
};

com.methods = {
    validate,
    submit,
    checkSubmit,
    sumbitText,
};

com.mounted = function () {
    var ctx = this;
};



//----------------------------functions----------------------
async function validate(ref, key) {
    this.$xglobal.fns.validate(this, ref);
};

/**
 * 创建submit
 */
async function submit() {
    var ctx = this;
    var ipt;
    try {
        //根据task.submitType判断
        var submit;
        if (ctx.fill.submitType == 'none') {
            ipt = 'none';
            //请求生成submit
            var api = ctx.$xglobal.conf.apis.sbmtCreate;
            var data = {
                token: localStorage.getItem('accToken'),
                content: ipt.value,
                type: ctx.fill.submitType,
            };
            var res = await ctx.rRun(api, data);
            submit = res.data;
            await ctx.checkSubmit(submit._id);

        } else if (ctx.fill.submitType == 'link') {
            //弹窗让用户输入链接地址
            ipt = await ctx.$prompt('请输入您的作业链接地址', '提交链接', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^[\S\s]{4,1024}$/,
                inputErrorMessage: '请正确输入连接地址'
            });

            //请求生成submit
            var api = ctx.$xglobal.conf.apis.sbmtCreate;
            var data = {
                token: localStorage.getItem('accToken'),
                content: ipt.value,
                type: ctx.fill.submitType,
            };
            var res = await ctx.rRun(api, data);
            submit = res.data;
            await ctx.checkSubmit(submit._id);
        } else if (ctx.fill.submitType == 'text') {
            ctx.textDialogVis = true;
            ctx.$set(ctx, 'textDialogVis', true);
        } else {
            var mimes = {
                'image': 'image/*',
                'video': 'video/*',
                'audio': 'audio/*',
                'file': '*',
            };

            var accept = mimes[ctx.fill.submitType];
            if (!accept) throw Error('作业提交格式设置异常，无法提交');

            var opt = {
                accept: accept,
                maxSize: 20480,
                success: async function (file) {
                    //请求生成submit
                    var api = ctx.$xglobal.conf.apis.sbmtCreate;
                    var data = {
                        token: localStorage.getItem('accToken'),
                        content: file.url,
                        type: ctx.fill.submitType,
                    };
                    var res = await ctx.rRun(api, data);
                    submit = res.data;
                    await ctx.checkSubmit(submit._id);
                },
                progress: async function (file, evt) {
                    ctx.$set(ctx.$data, 'submitting', true);
                    var per = Math.floor(evt.loaded / evt.total * 100);
                    ctx.$set(ctx.$data, 'uploadPer', per);
                    if (per >= 100) ctx.$set(ctx.$data, 'submitting', false);
                },
            };
            var res = await ctx.$xglobal.fns.startUploadQn.call(ctx, opt);
        };

    } catch (err) {
        ctx.$set(ctx.$data, 'submitting', false);
        if (ipt === undefined) return;
        ctx.$notify.error({
            title: '提交任务失败',
            message: err.tip || err.message,
        });
    }
};

/**
 * 生成text格式的submit并提交到服务器
 * textDialog的按钮点击
 */
async function sumbitText() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.sbmtCreate;
    var data = {
        token: localStorage.getItem('accToken'),
        content: ctx.textDialogData,
        type: ctx.fill.submitType,
    };
    var res = await ctx.rRun(api, data);
    submit = res.data;
    await ctx.checkSubmit(submit._id);
    ctx.$set(ctx, 'textDialogVis', false);
};





/**
 * 提交任务请求审核
 */
async function checkSubmit(submitId) {
    var ctx = this;
    try {
        //提交到check
        var api = ctx.$xglobal.conf.apis.chckSubmit;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.fill._id,
            planId: ctx.fill.plan._id,
            submitId: submitId,
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
