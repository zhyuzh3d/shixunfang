import Vue from 'vue';
import $ from 'jquery';
import Moment from 'moment';



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
import TaskCard from '../../practice/TaskCard/TaskCard.html';
import Fake from '../_data/fake.js';

com.components = {
    PracticeCard,
    ClassCard,
    TaskCard,
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
            case 'PracticeList':
                if (!ctx.hasGetPlanArr) await ctx.getMyPlanArr();
                break;
            case 'TaskList':
                if (!ctx.hasGetPlanArr) await ctx.getMyPlanArr();
                await ctx.getUnfiniTasks();
                //await ctx.getMyCurTaskArr();
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
        vgroupArr: [],
        grpSearching: false,
        myPlanArr: [],
        curPackArr: [],
        hasGetPlanArr: false,
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
    findMyGroup,
    joinGroup,
    getMyPlanArr,
    getMyCurTaskArr,
    getMyCurCheckArr,
    getUnfiniTasks,
};

//加载到页面前执行的函数
com.beforeMount = function () {};

com.mounted = async function () {
    var ctx = this;

    //如果地址栏没有跳转也没自动恢复，那么自动加载用户首页，首页根据用户身份区别处理
    var xconf = ctx.$xgetConf();
    if (xconf.xset === undefined || !xconf.xsetValue['activeName']) {
        await ctx.$xset({
            activeName: 'TaskList',
        });
    };

};

//-------functions--------

/**
 * 获取今天的任务列表
 */
async function getMyCurTaskArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.plnGetCurTaskArr;
    var data = {
        token: localStorage.getItem('accToken'),
    };

    var res = await ctx.rRun(api, data);
    var packArr = res.data;

    ctx.$data.curPackArr = packArr;

    //获取对应的check列表，并转为{task._id:check
    var checkArr = await ctx.getMyCurCheckArr();
    var checks = {};
    checkArr.forEach(function (check) {
        checks[check.task] = check;
    });

    //填充到每个task对象
    packArr.forEach(function (pack) {
        if (pack.tasks) return;
        pack.tasks.forEach(function (task) {
            if (checks[task._id]) {
                task.check = checks[task._id];
            };
        });
    });

    ctx.$set(ctx.$data, 'curPackArr', packArr);

    return res.data;
};


/**
 * 获取今天的任务列表
 */
async function getMyCurCheckArr() {
    var ctx = this;

    //组装curTaskIdArr参数
    var taskIdArr = [];
    ctx.$data.curPackArr.forEach(function (pack) {
        if (!pack.tasks) return;
        pack.tasks.forEach(function (task) {
            taskIdArr.push(task._id);
        });
    });

    var api = ctx.$xglobal.conf.apis.plnGetCheckArr;
    var data = {
        token: localStorage.getItem('accToken'),
        idArr: JSON.stringify(taskIdArr),
    };

    var res = await ctx.rRun(api, data);
    return res.data;
};

/**
 * 获取我的所有已经激活plan的信息
 */
async function getMyPlanArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.plnGetMyPlanArr;
    var data = {
        token: localStorage.getItem('accToken'),
    };

    var res = await ctx.rRun(api, data);

    res.data.forEach(function (item) {
        item.active = true;
    });

    ctx.$set(ctx.$data, 'myPlanArr', res.data);
    ctx.hasGetPlanArr = true;

    return res.data;
};


/**
 * 获取单个plan的详细信息
 */
async function getUnfiniTasks() {
    var ctx = this;

    //扫描所有plan，找出尚未结束的end>now
    var livePlanIdArr = [];
    var now = new Date().getTime();
    ctx.myPlanArr.forEach(function (plan) {
        var end = plan.end ? (new Date(plan.end).getTime()) : 0;
        if (end > now) {
            livePlanIdArr.push(plan._id);
        };
    });

    //从服务端拉取每个plan的详情
    if (livePlanIdArr.length < 1) return;
    var livePlanArr = [];
    var api = ctx.$xglobal.conf.apis.plnGetDetail;
    var data = {
        token: localStorage.getItem('accToken'),
    };
    for (var i = 0; i < livePlanIdArr.length; i++) {
        data._id = livePlanIdArr[i];
        var plan = await ctx.rRun(api, data);
        plan = plan.data;
        livePlanArr.push(plan);
    };

    //计算每个plan的course.packs，提取所有早于今天的pack
    var pastPackIdArr = [];
    var pastPackArr = [];
    var pastTaskArr = [];
    var pastTaskIdArr = [];
    livePlanArr.forEach(function (plan) {
        if (!plan.course || !plan.course.packs) return;
        var begin = plan.begin;
        if (!begin) return;
        begin = Moment(begin);
        plan.course.packs.forEach(function (pack) {
            if (Number(begin.format('x')) < now) { //早于今天
                console.log('>>>pack.title', pack.title)
                pack.date = begin;
                pastPackArr.push(pack);
                pastPackIdArr.push(pack._id);

                //提取tasks
                if (pack.tasks) {
                    pack.tasks.forEach(function (task) {
                        if (pastTaskIdArr.indexOf(task._id) == -1) {
                            task.date = begin;
                            pastTaskIdArr.push(task._id);
                            pastTaskArr.push(task);
                        }
                    });
                };
            };
            if (pack.days) {
                begin.add(Number(pack.days), 'days');
            } else {
                begin.add(1, 'days');
            };
        });
    });

    //从服务端获取所有taskarr对应的check，然后判断是否已经完成
    api = ctx.$xglobal.conf.apis.plnGetCheckArr;
    var data = {
        token: localStorage.getItem('accToken'),
        idArr: JSON.stringify(pastTaskIdArr),
    };
    var checkArr = await ctx.rRun(api, data);
    checkArr = checkArr.data;


    //把check赋值到对应的task
    pastTaskArr.forEach(function (task) {
        checkArr.forEach(function (check) {
            if (check.task == task._id) {
                task.check = check;
            };
        });
    });

    ctx.$set(ctx.$data, 'curPackArr', pastPackArr);

    return pastTaskArr;
};





/**
 * 加入一个班级
 * 将自身加入到group.members
 */
async function joinGroup(grp) {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.grpJoinGroup;
    var data = {
        token: localStorage.getItem('accToken'),
        _id: grp._id,
    };
    var res = await ctx.rRun(api, data);
};


/**
 * 寻找我的班级
 * 通过扫描我的手机号对应的vuser对象匹配哪些group我可以加入
 */
async function findMyGroup() {
    var ctx = this;
    ctx.$set(ctx.$data, 'grpSearching', true);
    var api = ctx.$xglobal.conf.apis.grpFindMyGroup;
    var data = {
        token: localStorage.getItem('accToken'),
    };

    var res = await ctx.rRun(api, data);
    var grpArr = res.data;
    grpArr.forEach(function (item) {
        item.pending == true;
    });
    ctx.$set(ctx.$data, 'vgroupArr', res.data);
    ctx.$set(ctx.$data, 'grpSearching', false);
};


/**
 * 标签卡切换,并且读取并刷新数据
 */
async function xgoTab(tab) {
    var ctx = this;
    ctx.$xset({
        activeName: ctx.$data.activeName
    });
};


/**
 * 获取我的班级列表
 */
async function getMyGroupArr() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.grpGetMyGroupArr;
    var data = {
        token: localStorage.getItem('accToken'),
    };

    var res = await ctx.rRun(api, data);

    var groups = res.data;
    groups.forEach(function (item) {
        item.members = undefined;
    });

    ctx.$set(ctx.$data, 'myGroupArr', res.data);
};








//
