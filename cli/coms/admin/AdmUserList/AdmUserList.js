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
}
from 'element-ui'
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Button);

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
    showDetails: function (item) {
        console.log('>>>row', item.row);
    },
};

com.mounted = async function () {
    var ctx = this;
    await getUserList.call(ctx);
};


//--------------------------functions---------------------------

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
