import Vue from 'vue'
import $ from 'jquery';
import Moment from 'moment';
var com = {};
export default com;

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from units/PracticeCard/PracticeCard.js'
    };
};

com.props = {
    fill: Object,
    index: Number,
};

com.methods = {
    getMyRole: function () {
        var ctx = this;
        var group = ctx.fill;

        var accInfo = ctx.$xglobal.accInfo;
        if (!accInfo) return;

        var myRole = '未知'
        if (group && group.manager == accInfo._id) {
            myRole = '管理员';
        } else {
            if (group.teachers && group.teachers.indexOf(accInfo._id) != -1) myRole = '导师';
            if (group.assistants && group.assistants.indexOf(accInfo._id) != -1) myRole = '助理';
            if (group.members && group.members.indexOf(accInfo._id) != -1) isMember = '普通成员';
        };

        ctx.$set(ctx.fill, 'myRole', myRole);
    },
    goClassDetail: function () {
        var ctx = this;
        var tarCtx = ctx.$xcoms['App_mainView-Tt'];

        tarCtx.$xgo({
            classDetailId: ctx.fill._id || null,
            homeView: 'ClassDetail',
        });
    },
};

com.mounted = function () {
    var ctx = this;
    ctx.getMyRole();
};
