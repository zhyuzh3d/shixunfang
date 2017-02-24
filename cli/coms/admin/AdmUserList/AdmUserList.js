/**
 * 账号管理登录注册弹窗
 */

import Vue from 'vue';
import $ from 'jquery';
import md5 from 'md5';

import {
    Table,
    TableColumn,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
}
from 'element-ui'
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Button);
Vue.use(Dropdown);
Vue.use(DropdownItem);
Vue.use(DropdownMenu);

var com = {};
export default com;

//所有直接用到的组件在这里导入
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
        msg: 'Hello from admin/AdmUserList/AdmUserList.js',
        userArr: [],
    };
};

com.methods = {
    blockUser,
    getUserList,
    setPower,
};

com.mounted = async function () {
    var ctx = this;
    await getUserList.call(ctx);
};


//--------------------------functions---------------------------

/**
 * 设置用户权限
 */
async function setPower(item, pwr) {
    var ctx = this;
    var user = item.row;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.user.update({mobile:"${user.mobile}"},{power:'${pwr}'})`,
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(item.row, 'power', pwr);
};



/**
 * 屏蔽用户
 */
async function blockUser(item, block) {
    var ctx = this;
    var user = item.row;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.user.update({mobile:"${user.mobile}"},{__del:${block}})`,
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(item.row, '__del', block);
};

/**
 * 获取用户列表
 */
async function getUserList() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.user.find({},"").sort({created_at:-1}).limit(50)',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'userArr', res.data);
}


//
