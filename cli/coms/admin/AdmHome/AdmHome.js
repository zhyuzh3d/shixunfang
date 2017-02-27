/**
 * 账号管理登录注册弹窗
 */

import Vue from 'vue';
import $ from 'jquery';
import md5 from 'md5';

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

var com = {};
export default com;


var xsetConf = {};
xsetConf.activeName = {
    before: async function beforeXsetHomeView(name, oldName, ctx) {
        var com;
        switch (name) {
            case 'AdmSchoolList':
                var com = await System.import('../../admin/AdmSchoolList/AdmSchoolList.html');
                break;
            case 'AdmUserList':
                var com = await System.import('../../admin/AdmUserList/AdmUserList.html');
                break;
            case 'AdmClassList':
                var com = await System.import('../../admin/AdmClassList/AdmClassList.html');
                break;
            default:
                var com = await System.import('../../admin/AdmUserList/AdmUserList.html');
                break;
        };
        ctx.$set(ctx.$data.coms, name, name);
        Vue.component(name, com);
    },
};


com.props = {
    xid: {
        type: String,
        default: 'AdmHome',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from admin/AdmHome/AdmHome.js',
        userArr: [],
        _xsetConf: xsetConf,
        coms: {},
        activeName: 'AdmUserList',
    };
};

com.methods = {
    goUserHome: function () {
        var ctx = this;
        ctx.$xcoms['App_mainView-Tt'].$xgo({
            homeView: 'UserHome',
        });
    },
    xgoTab: async function () {
        this.$xset({
            activeName: this.$data.activeName
        });
    },
};

com.mounted = async function () {
    var ctx = this;
    //如果地址栏没有跳转也没自动恢复，那么自动加载用户首页，首页根据用户身份区别处理
    var xconf = ctx.$xgetConf();
    if (!xconf.xset || !xconf.xsetValue['activeName']) {
        await ctx.$xset({
            activeName: 'AdmUserList',
        });
    };
};


//--------------------------functions---------------------------


//
