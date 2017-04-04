import Vue from 'vue'
import $ from 'jquery';
import Moment from 'moment';
Moment.locale('zh-cn');

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
    DatePicker,
}
from 'element-ui'
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Tabs);
Vue.use(Row);
Vue.use(Col);
Vue.use(TabPane);
Vue.use(DatePicker);
const notify = Notification
Vue.prototype.$notify = notify;
const confirm = MessageBox.confirm;
Vue.prototype.$confirm = confirm;
const prompt = MessageBox.prompt;
Vue.prototype.$prompt = prompt;

import Fake from '../_data/fake.js';
import TaskCard from '../../practice/TaskCard/TaskCard.html';
import PackCard from '../../practice/PackCard/PackCard.html';
import UserCard from '../../practice/UserCard/UserCard.html';
import PackList from '../../practice/PackList/PackList.html';
import SelectGroup from '../../dialog/SelectGroup/SelectGroup.html';

com.components = {
    UserCard,
    TaskCard,
    PackCard,
    SelectGroup,
    PackList,
};

com.data = function data() {
    var ctx = this;
    var ttCtx = ctx.$xcoms['App_mainView-Tt'];

    return {
        msg: 'Hello from practice/PracticeDetail/PracticeDetail.js',
        activeName: 'practice',
        planInfo: {
            _id: ttCtx.$data.planeDetailId,
        },
        curPack: undefined, //今天的任务包
        course: {}, //全套课程
        beginDialogVis: false,
        beginDate: undefined,
        endDialogVis: false,
        endDate: undefined,
        amembers: [], //plan.members+group.vmembers
        selectGroupDialogVis: false,
        selectGroupDialogConf: {
            okfn: ctx.editGroup,
            cancelfn: function () {
                ctx.$set(ctx.$data, 'selectGroupDialogVis', false)
            },
        },
    };
};

com.props = {
    xid: {
        type: String,
        default: 'ClassDetail'
    },
};

com.methods = {
    getPlanInfo,
    editTitle,
    editBegin,
    editEnd,
    editDesc,
    editGroup,
    removeMemeber,
    removeTeacher,
    addTeacher,
    removeAssistant,
    addAssistant,
    getGroupVmembers,
    genPackDate,

    Moment,
    xgoTab,
    goBack,
    goHome,
    goGroup,
};

com.mounted = async function () {
    var ctx = this;
    await ctx.getPlanInfo();
    ctx.xsearch();
};



//--------------functions--------------
/**
 * 移除成员
 */
async function removeMemeber(usr) {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.plnRemoveMemeber;
    var data = {
        token: localStorage.getItem('accToken'),
        type: 'teacher',
        _id: ctx.$data.planInfo._id,
        uid: usr._id,
    };

    var res = await ctx.rRun(api, data);
    await ctx.getPlanInfo();
};

/**
 * 移除一个导师
 */
async function removeTeacher(usr) {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.plnRemoveUser;
    var data = {
        token: localStorage.getItem('accToken'),
        type: 'teacher',
        pid: ctx.$data.planInfo._id,
        uid: usr._id,
    };

    var res = await ctx.rRun(api, data);
    await ctx.getPlanInfo();
};

/**
 * 弹出对话框，通过电话号码添加一个导师,导师必须已经注册
 */
async function addTeacher(usr) {
    var ctx = this;
    try {
        var ipt = await ctx.$prompt('请输入导师的电话号码', '添加导师', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^1\d{10}$/,
            inputErrorMessage: '电话号码不正确，应为11位数组'
        });

        var api = ctx.$xglobal.conf.apis.plnAddUser;
        var data = {
            token: localStorage.getItem('accToken'),
            type: 'teacher',
            pid: ctx.$data.planInfo._id,
            mobile: ipt.value,
        };

        var res = await ctx.rRun(api, data);
        await ctx.getPlanInfo();
    } catch (err) {
        ctx.$notify.error({
            title: '添加失败',
            message: err.tip || err.message,
        });
    };
};

/**
 * 移除一个助理
 */
async function removeAssistant(usr) {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.plnRemoveUser;
    var data = {
        token: localStorage.getItem('accToken'),
        type: 'assistant',
        pid: ctx.$data.planInfo._id,
        uid: usr._id,
    };

    var res = await ctx.rRun(api, data);
    await ctx.getPlanInfo();
};

/**
 * 弹出对话框，通过电话号码添加一个助理,助理必须已经注册
 */
async function addAssistant(usr) {
    var ctx = this;
    try {
        var ipt = await ctx.$prompt('请输入助理的电话号码', '添加导师', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^1\d{10}$/,
            inputErrorMessage: '电话号码不正确，应为11位数组'
        });

        var api = ctx.$xglobal.conf.apis.plnAddUser;
        var data = {
            token: localStorage.getItem('accToken'),
            type: 'assistant',
            pid: ctx.$data.planInfo._id,
            mobile: ipt.value,
        };

        var res = await ctx.rRun(api, data);
        await ctx.getPlanInfo();
    } catch (err) {
        ctx.$notify.error({
            title: '添加失败',
            message: err.tip || err.message,
        });
    };
};



/**
 * 编辑公告
 */
async function editDesc() {
    var ctx = this;
    try {
        var ipt = await ctx.$prompt('请输入新公告', '修改公告', {
            inputPattern: /[\s\S]{1,256}/,
            inputErrorMessage: '任意1～256字符'
        });
        var api = ctx.$xglobal.conf.apis.plnUpdateDesc;
        var data = {
            token: localStorage.getItem('accToken'),
            desc: ipt.value,
            _id: ctx.planInfo._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.planInfo, 'desc', ipt.value);
    } catch (err) {
        ctx.$notify.error({
            title: '编辑失败!',
            message: err.tip || err.message,
        });
    };
};


/**
 * 编辑标题
 */
async function editTitle() {
    var ctx = this;
    try {
        var ipt = await ctx.$prompt('请输入新标题', '修改标题', {
            inputPattern: /[\s\S]{1,32}/,
            inputErrorMessage: '任意1～32字符'
        });
        var api = ctx.$xglobal.conf.apis.plnUpdateTitle;
        var data = {
            token: localStorage.getItem('accToken'),
            title: ipt.value,
            _id: ctx.planInfo._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.planInfo, 'title', ipt.value);
    } catch (err) {
        ctx.$notify.error({
            title: '编辑失败!',
            message: err.tip || err.message,
        });
    };
};

/**
 * 编辑开始日期
 */
async function editBegin() {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.plnUpdateBegin;
        var data = {
            token: localStorage.getItem('accToken'),
            begin: Moment(ctx.beginDate).format('YYYY-MM-DD'),
            _id: ctx.planInfo._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.planInfo, 'begin', data.begin);
        ctx.beginDialogVis = false;
    } catch (err) {
        ctx.$notify.error({
            title: '编辑失败!',
            message: err.tip || err.message,
        });
    };
};



/**
 * 编辑结束日期
 */
async function editEnd() {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.plnUpdateEnd;
        var data = {
            token: localStorage.getItem('accToken'),
            end: Moment(ctx.endDate).format('YYYY-MM-DD'),
            _id: ctx.planInfo._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.planInfo, 'end', data.end);
        ctx.endDialogVis = false;
    } catch (err) {
        ctx.$notify.error({
            title: '编辑失败!',
            message: err.tip || err.message,
        });
    };
};

/**
 * 编辑结束日期
 */
async function editGroup(school, group) {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.plnUpdateGroup;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.planInfo._id,
            gid: group._id,
        };

        var res = await ctx.rRun(api, data);
        ctx.$set(ctx.planInfo, 'group', group);
        ctx.selectGroupDialogVis = false;

        //刷新成员数据
        await ctx.getPlanInfo();

    } catch (err) {
        ctx.$notify.error({
            title: '编辑失败!',
            message: err.tip || err.message,
        });
    };
};


/**
 * 获取group的虚拟成员列表
 */
async function getGroupVmembers() {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.grpGetVmembers;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.planInfo.group._id,
        };

        var res = await ctx.rRun(api, data);

        //合并vmembers和members为amembers
        var vmembers = res.data;
        var members = ctx.planInfo.members;
        var amembers = [];
        members.forEach(function (m) {
            amembers.push(m);
        });

        vmembers.forEach(function (vm) {
            var exist = false;
            for (var i = 0; i < members.length; i++) {
                var mb = members[i];
                if (vm.mobile == mb.mobile) {
                    exist = true;
                    mb.alias = mb.name;
                    mb.name = vm.name;
                };
            };
            if (!exist) amembers.push(vm);
        });

        ctx.$set(ctx.$data, 'amembers', amembers);

    } catch (err) {
        ctx.$notify.error({
            title: '获取班级成员列表失败!',
            message: err.tip || err.message,
        });
    };
};


/**
 * 获取plan详细信息
 */
async function getPlanInfo() {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.plnGetDetail;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: ctx.planInfo._id,
        };

        var res = await ctx.rRun(api, data);
        var plan = res.data;
        ctx.$set(ctx.$data, 'planInfo', plan);
        if (plan.course) ctx.$set(ctx.$data, 'course', plan.course);

        //计算用户的plan角色
        var accInfo = ctx.$xglobal.accInfo;
        var myRole = undefined;
        if (plan.manager && plan.manager._id == accInfo._id) {
            myRole = '管理员';
        } else {
            plan.teachers.forEach(function (item) {
                if (item._id == accInfo._id) myRole = '导师';
            });
            if (myRole == '未知') {
                plan.assistants.forEach(function (item) {
                    if (item._id == accInfo._id) myRole = '助理';
                });
            };
        };
        plan.myRole = myRole;

        plan.members.forEach(function (item) {
            item.active = true;
        });

        //计算每个pack的日期,同时设定pack.plan以便于向下传递到task才能提交
        ctx.genPackDate();


        //对管理员显示成员列表，对普通成员不显示成员列表
        if (plan.myRole) await ctx.getGroupVmembers();

    } catch (err) {
        ctx.$notify.error({
            title: '获取方案信息失败!',
            message: err.tip || err.message,
        });
    };
};

/**
 * 计算每个pack的实际日期
 * 以begin为参考，每个pack加1天
 */
function genPackDate() {
    var ctx = this;
    var packs = ctx.planInfo.course.packs;
    var begin = ctx.planInfo.begin;

    var date = begin;
    for (var i = 0; i < packs.length; i++) {
        var pack = packs[i];
        pack.plan = ctx.planInfo;
        pack.date = date;
        date = Moment(date).add(Number(pack.days), 'days');
    };
};







//---------------functions------------
function goHome() {
    var ctx = this;
    var tarCtx = ctx.$xcoms['App_mainView-Tt'];

    tarCtx.$xgo({
        homeView: 'UserHome',
    });
};

function goBack() {
    history.back()
};

function xgoTab() {
    this.$xset({
        activeName: this.$data.activeName
    });
};

function goGroup() {
    var ctx = this;
    var tarCtx = ctx.$xcoms['App_mainView-Tt'];
    var gid = ctx.planInfo.group._id;

    tarCtx.$xgo({
        classDetailId: gid,
        homeView: 'ClassDetail',
    });
};







//
