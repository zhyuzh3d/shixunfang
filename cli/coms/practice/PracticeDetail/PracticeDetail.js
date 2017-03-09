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
            return Fake.practiceArr[0];
        },
    }
};

com.methods = {
    getPlanInfo,
    xgoTab,
    goBack,
    goHome,
};

com.mounted = function () {
    var ctx = this;
    $(document).ready(function () {
        $('.el-tabs__item:contains(全部日程)').html('全部日程<span class="warntag">' + ctx.fill.daysDelayCount + '</span>');
        $('.el-tabs__item:contains(每日任务)').html('每日任务<span class="warntag">' + ctx.fill.days[0].taskArr.length + '</span>');
    });


    ctx.getPlanInfo();

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
