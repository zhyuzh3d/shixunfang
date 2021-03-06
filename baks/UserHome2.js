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

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from practice/TeacherHome/TeacherHome.js',
        activeName: 'practice',
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
    xgoTab: function () {
        this.$xset({
            activeName: this.$data.activeName
        });
    },
};

//加载到页面前执行的函数
com.beforeMount = function () {};

com.mounted = async function () {};

//-------functions--------
