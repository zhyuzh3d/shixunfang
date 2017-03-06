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
    xgoTab: function () {
        this.$xset({
            activeName: this.$data.activeName
        });
    },
    goBack: function () {
        history.back()
    },
    goHome: function () {
        var ctx = this;
        var tarCtx = ctx.$xcoms['App_mainView-Tt'];

        tarCtx.$xgo({
            homeView: 'UserHome',
        });
    },

    getGroupInfo,

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
 * 获取单个班级的详细信息
 */
async function getGroupInfo() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.getGroupDetail;
    var data = {
        token: localStorage.getItem('accToken'),
        _id: ctx.$data.groupInfo._id,
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'groupInfo', res.data);

};









//
