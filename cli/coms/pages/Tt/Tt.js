/**
 * 根据用户身份，加载老师页面或学生页面，不自动恢复
 */

import Vue from 'vue';
import $ from 'jquery';

let com = {};
export default com;

import {
    Button,
}
from 'element-ui';
Vue.use(Button);

com.components = {};

var xsetConf = {};
xsetConf.homeView = {
    before: async function beforeXsetHomeView(name, oldName, ctx) {
        var com;
        switch (name) {
            case 'Account':
                var com = await System.import('../../user/Account/Account.html');
                break;
            case 'PracticeDetail':
                var com = await System.import('../../practice/PracticeDetail/PracticeDetail.html');
                break;
            case 'SchoolDetail':
                var com = await System.import('../../practice/SchoolDetail/SchoolDetail.html');
                break;
            case 'UserDetail':
                var com = await System.import('../../practice/UserDetail/UserDetail.html');
                break;
            case 'ClassDetail':
                var com = await System.import('../../practice/ClassDetail/ClassDetail.html');
                break;
            case 'UserHome':
                var com = await System.import('../../practice/UserHome/UserHome.html');
                break;
            case 'AdmHome':
                var com = await System.import('../../admin/AdmHome/AdmHome.html');
                break;
            default:
                var com = await System.import('../../practice/UserHome/UserHome.html');
                break;
        };

        Vue.component(name, com);
    },
};


//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from blocks/Tt/Tt.js',
        homeView: '',
        _xsetConf: xsetConf,
        accInfo: ctx.$xglobal.accInfo,
        practiceDetailId: '', //映射到PracticeDetail页面
        classDetailId: '', //映射到classDetail页面
        planeDetailId: '', //映射到PracticeDetail页面
        userDetailId: '', //映射到userDetail页面
        schoolDetailId: '', //映射到schoolDetail页面
        _xrestoreDisabled: true, //停用自动恢复
    };
};

com.props = {
    xid: {
        type: String,
        default: 'Tt',
    },
};

//所有直接使用的方法写在这里
com.methods = {
    goAdmHome: async function () {
        var ctx = this;
        await ctx.$xgo({
            homeView: 'AdmHome',
        });
    },
};

//加载到页面前执行的函数
com.mounted = async function () {
    var ctx = this;

    await ctx.$xglobal.fns.autoLogin(ctx);
    ctx.$set(ctx.$data, 'accInfo', ctx.$xglobal.accInfo);

    if (!ctx.$xglobal.accInfo) {
        //如果用户没有登录，那么强制跳转到account账号管理页面
        await ctx.$xset({
            homeView: 'Account',
        });
    } else {
        //如果地址栏没有跳转也没自动恢复，那么自动加载用户首页，首页根据用户身份区别处理
        var xhash = await ctx.$xsetByHash();
        var xConfHash = ctx.$xgetConf();
        if (!xConfHash.xhash || !xConfHash.xhashValue['homeView']) {
            await ctx.$xgo({
                homeView: 'UserHome',
            });
        };
    };
};


//-------functions--------
