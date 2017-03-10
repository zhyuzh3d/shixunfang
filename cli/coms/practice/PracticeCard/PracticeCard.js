import Vue from 'vue'
import $ from 'jquery';
import Moment from 'moment';
var com = {};
export default com;

//所有数据写在这里
com.data = function data() {
    var ctx = this;

    return {
        msg: 'Hello from units/PracticeCard/PracticeCard.js',
    };
};

com.props = {
    fill: Object,
    index: Number,
};

com.methods = {
    isExpire,
    goPracticeDetail,
    forceRefresh,
    joinPlan,
};

com.mounted = function () {
    var ctx = this;
    com.Tt = ctx.$xcoms['App_mainView-Tt'];
    ctx.isExpire();
};

//-------------------functions--------------


/**
 * 加入一个实训方案,成功后跳转进入
 */
async function joinPlan() {
    var ctx = this;
    try {

        var api = ctx.$xglobal.conf.apis.plnJoinPlan;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.fill._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.fill.active = true;
        //ctx.goPracticeDetail();
    } catch (err) {
        ctx.$notify.error({
            title: '加入失败!',
            message: err.tip || err.message,
        });
    };
};

/**
 * 判断是否过期
 */
function isExpire() {
    var ctx = this;
    var plan = ctx.fill;
    var now = new Date().getTime();

    if (new Date(plan.begin).getTime() < now && new Date(plan.end).getTime() > now) {
        plan.open = true;
        ctx.$set(ctx.fill, 'open', true);
    };
    ctx.forceRefresh();
};


/**
 * 强制刷新
 */
function forceRefresh() {
    var ctx = this;
    var ttl = ctx.fill.title;
    ctx.$set(ctx.fill, 'title', '');
    ctx.$set(ctx.fill, 'title', ttl);
};


/**
 * 跳转到实训详情页面
 */
function goPracticeDetail() {
    var ctx = this;
    var tarCtx = ctx.$xcoms['App_mainView-Tt'];

    if (ctx.fill.active) {
        tarCtx.$xgo({
            planeDetailId: ctx.fill._id || null,
            homeView: 'PracticeDetail',
        });
    };
};
