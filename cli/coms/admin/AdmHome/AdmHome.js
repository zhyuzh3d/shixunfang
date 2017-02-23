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

//所有直接用到的组件在这里导入
import AdmUserList from '../../admin/AdmUserList/AdmUserList.html';
com.components = {
    AdmUserList,
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
        activeName: 'AdmUserList'
    };
};

com.methods = {
    xgoTab: function () {
        this.$xset({
            activeName: this.$data.activeName
        });
    },
};

com.mounted = async function () {
    var ctx = this;
};


//--------------------------functions---------------------------


//
