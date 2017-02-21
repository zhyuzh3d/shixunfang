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
import Login from '../../user/Login/Login.html'
import Register from '../../user/Register/Register.html'
com.components = {
    Login,
    Register,
};

com.props = {
    xid: {
        type: String,
        default: 'Account',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from user/Account/Account.js',
        actTab: 'login',
    };
};

com.watch = {

};

//所有直接使用的方法写在这里
com.methods = {
    test: function () {
        var ctx = this;
        return new Date();
    },
};

//加载到页面后执行的函数
com.mounted = function () {
    var ctx = this;
    //    console.log('xxxxxx', ctx.$data);
};

//--------------------------functions---------------------------
