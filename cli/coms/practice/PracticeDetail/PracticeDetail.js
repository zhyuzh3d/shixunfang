import Vue from 'vue'
import $ from 'jquery';
var com = {};
export default com;

import {
    Dialog,
    Button,
    Tabs,
    Row,
    Col,
    Notification,
    TabPane,
    MessageBox,
}
from 'element-ui'
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Tabs);
Vue.use(Row);
Vue.use(Col);
Vue.use(TabPane);
const notify = Notification
Vue.prototype.$notify = notify;
const confirm = MessageBox.confirm;
Vue.prototype.$confirm = confirm;

import Fake from '../_data/fake.js';
import UserCard from '../../practice/PracticeDetail/PracticeDetail.html';
import TaskCard from '../../practice/TaskCard/TaskCard.html';

com.components = {
    UserCard,
    TaskCard,
};

com.data = function data() {
    var ctx = this;
    var ttCtx = ctx.$xcoms['App_mainView-Tt'];

    return {
        msg: 'Hello from practice/PracticeDetail/PracticeDetail.js',
        activeName: 'practice',
        planInfo: {
            _id: ttCtx.$data.planeDetailId,
        },
        todayTaskArr: [], //今天及以前未完成的任务
        course: {}, //全套课程
        editDialogVis:false,
    };
};

com.props = {
    xid: {
        type: String,
        default: 'ClassDetail'
    },
};

com.methods = {
    getPlanInfo,
    xgoTab,
    goBack,
    goHome,
};

com.mounted = async function () {
    var ctx = this;
    await ctx.getPlanInfo();
};



//--------------functions--------------
/**
 * 获取plan详细信息
 */
async function getPlanInfo() {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.plnGetDetail;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.planInfo._id,
        };

        var res = await ctx.rRun(api, data);
        var plan=res.data;
        ctx.$set(ctx.$data, 'planInfo', plan);
        if (plan.course) ctx.$set(ctx.$data, 'course', plan.course);

        //计算用户的plan角色
        var accInfo = ctx.$xglobal.accInfo;
        var myRole = '未知'
        if (plan.manager._id == accInfo._id) {
            myRole = '管理员';
        } else {
            plan.teachers.forEach(function (item) {
                if (item._id == accInfo._id) myRole = '导师';
            });
            if (myRole == '未知') {
                plan.assistants.forEach(function (item) {
                    if (item._id == accInfo._id) myRole = '助理';
                });
            };
        };
        plan.myRole = myRole;



    } catch (err) {
        ctx.$notify.error({
            title: '加入失败!',
            message: err.tip || err.message,
        });
    };
};









//---------------functions------------
function goHome() {
    var ctx = this;
    var tarCtx = ctx.$xcoms['App_mainView-Tt'];

    tarCtx.$xgo({
        homeView: 'UserHome',
    });
}

function goBack() {
    history.back()
};

function xgoTab() {
    this.$xset({
        activeName: this.$data.activeName
    });
};









//
