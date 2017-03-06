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
import PracticeCard from '../../practice/PracticeCard/PracticeCard.html';
import UserCard from '../../practice/UserCard/UserCard.html';
import SchoolCard from '../../practice/SchoolCard/SchoolCard.html';

com.components = {
    PracticeCard,
    UserCard,
    SchoolCard,
};

com.data = function data() {
    var ctx = this;
    var ttCtx = ctx.$xcoms['App_mainView-Tt'];

    return {
        msg: 'Hello from pages/ClassDetail/ClassDetail.js',
        activeName: 'practice',
        practiceArr: Fake.practiceArr,
        accInfo: Fake.accInfo,
        groupInfo: {
            _id: ttCtx.$data.classDetailId,
        },
        myPlanArr: [],
    };
};

com.props = {
    xid: {
        type: String,
        default: 'ClassDetail'
    },
    fill: {
        type: Object,
        default: function () {
            return Fake.classArr[0];
        },
    }
};

com.methods = {
    getGroupInfo,
    getMyPlanArr,
    xgoTab,
    goBack,
    goHome,
};

com.beforeMount = async function () {
    var ctx = this;
    await ctx.getGroupInfo();
};

com.mounted = async function () {
    var ctx = this;
};


//--------functions----------

/**
 * 获取我的所有已经激活plan的信息
 */
async function getMyPlanArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.plnGetMyPlanArr;
    var data = {
        token: localStorage.getItem('accToken'),
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'myPlanArr', res.data);
    return res.data;
};

/**
 * 获取单个班级的详细信息
 */
async function getGroupInfo() {
    var ctx = this;

    var myPlans = await ctx.getMyPlanArr();
    var planIdArr = [];
    myPlans.forEach(function (item, n) {
        planIdArr.push(item._id);
    });

    var api = ctx.$xglobal.conf.apis.grpGetGroupDetail;
    var data = {
        token: localStorage.getItem('accToken'),
        _id: ctx.$data.groupInfo._id,
    };

    var res = await ctx.rRun(api, data);
    var group = res.data;

    //计算方案是否被用户激活active
    group.plans.forEach(function (item, n) {
        if (planIdArr.indexOf(item._id) != -1) {
            item.active = true;
        };

    });

    //计算用户的班级角色role
    var accInfo = ctx.$xglobal.accInfo;
    var myRole = '未知'
    if (group.manager._id == accInfo._id) {
        myRole = '管理员';
    } else {
        group.teachers.forEach(function (item) {
            if (item._id == accInfo._id) myRole = '导师';
        });
        if (myRole == '未知') {
            group.assistants.forEach(function (item) {
                if (item._id == accInfo._id) myRole = '助理';
            });
        };
    };
    group.myRole = myRole;

    ctx.$set(ctx.$data, 'groupInfo', group);
};



//------functions-----

function xgoTab() {
    this.$xset({
        activeName: this.$data.activeName
    });
};

function goBack() {
    history.back()
};

function goHome() {
    var ctx = this;
    var tarCtx = ctx.$xcoms['App_mainView-Tt'];

    tarCtx.$xgo({
        homeView: 'UserHome',
    });
};



//
