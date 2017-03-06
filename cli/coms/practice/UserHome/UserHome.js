import Vue from 'vue';
import $ from 'jquery';



let com = {};
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

import PracticeCard from '../../practice/PracticeCard/PracticeCard.html';
import ClassCard from '../../practice/ClassCard/ClassCard.html';
import Fake from '../_data/fake.js';

com.components = {
    PracticeCard,
    ClassCard,
};

var xsetConf = {};
xsetConf.activeName = {
    before: async function beforeXsetHomeView(name, oldName, ctx) {
        var com;
        var cname;
        switch (name) {
            case 'profile':
                var com = await System.import('../../user/Profile/Profile.html');
                cname = 'Profile';
                break;
            case 'ClassList':
                await ctx.getMyGroupArr();
                break;
            default:
                var com = await System.import('../../user/Profile/Profile.html');
                cname = 'Profile';
                break;
        };
        Vue.component(cname, com);
        ctx.$set(ctx.$data.coms, cname, cname);
    },
};



//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from practice/UserHome/UserHome.js',
        _xsetConf: xsetConf,
        coms: {},
        activeName: '',
        myGroupArr: [],
        practiceArr: Fake.practiceArr,
        classArr: Fake.classArr,
        accInfo: Fake.accInfo,
    };
};

com.props = {
    xid: {
        type: String,
        default: 'UserHome',
    },
};

//所有直接使用的方法写在这里
com.methods = {
    xgoTab,
    getMyGroupArr,
};

//加载到页面前执行的函数
com.beforeMount = function () {};

com.mounted = async function () {
    var ctx = this;

    //如果地址栏没有跳转也没自动恢复，那么自动加载用户首页，首页根据用户身份区别处理
    var xconf = ctx.$xgetConf();
    if (!xconf.xset || !xconf.xsetValue['activeName']) {
        await ctx.$xset({
            activeName: 'PracticeList',
        });
    };
};

//-------functions--------

/**
 * 标签卡切换,并且读取并刷新数据
 */
async function xgoTab(tab) {
    var ctx = this;
    this.$xset({
        activeName: this.$data.activeName
    });
};


/**
 * 获取我的班级列表
 */
async function getMyGroupArr() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.getMyGroupArr;
    var data = {
        token: localStorage.getItem('accToken'),
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'myGroupArr', res.data);

};








//
