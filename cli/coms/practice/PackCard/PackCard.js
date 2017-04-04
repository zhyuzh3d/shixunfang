import Vue from 'vue'
import $ from 'jquery';
import Moment from 'moment';
Moment.locale('zh-cn');

import TaskCard from '../../practice/TaskCard/TaskCard.html';

var com = {};
com.components = {
    TaskCard,
};
export default com;

import {
    Button,
    Row,
    Col,
}
from 'element-ui'
Vue.use(Button);
Vue.use(Row);
Vue.use(Col);

//所有数据写在这里
com.data = function data() {
    return {
        msg: 'Hello from paractice/PackCard/PackCard.js',
        tasksVis: false,
    };
};

com.props = {
    fill: {
        type: Object,
    },
    index: Number,
};


com.methods = {
    Moment,
    showTasks,
};

com.mounted = function () {
    var ctx = this;

    if (Moment(ctx.fill.date).format('MMDD') == Moment().format('MMDD')) {
        ctx.$set(ctx.fill, 'isToday', true);
    };
    //为每个task指定plan
    if (ctx.fill.plan) {
        ctx.fill.tasks.forEach(function (task) {
            task.plan = ctx.fill.plan;
        });
    };
};


//----------------------------functions----------------------

/**
 * 显示日程下的所有任务，并显示任务的完成状态
 */
async function showTasks() {
    var ctx = this;
    var vis = !ctx.tasksVis;
    if (!vis) {
        ctx.$set(ctx.$data, 'tasksVis', vis);
        return;
    };

    //获取任务id列表,以便于拉取对应的check获取状态
    var taskIdArr = [];
    var tasks = ctx.fill.tasks;
    if (!tasks) return;
    tasks.forEach(function (task) {
        taskIdArr.push(task._id);
    });

    //获取所有tasks对应的checks
    var api = ctx.$xglobal.conf.apis.plnGetCheckArr;
    var data = {
        token: localStorage.getItem('accToken'),
        idArr: JSON.stringify(taskIdArr),
    };
    var checkArr = await ctx.rRun(api, data);
    checkArr = checkArr.data;

    //指定每个任务对应的task并指定到task.check
    checkArr.forEach(function (check) {
        tasks.forEach(function (task) {
            if (check.task == task._id) {
                task.check = check;
            };
        });
    });

    ctx.$set(ctx.fill, 'tasks', tasks);
    ctx.$set(ctx.$data, 'tasksVis', vis);
};






//
