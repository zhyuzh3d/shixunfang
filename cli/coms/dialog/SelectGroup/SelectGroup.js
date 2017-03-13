/**
 * 选择院校的弹窗
 * conf:{schoolObj,classObj,okfn:function(schoolObj,groupObj){},cancelfn}
 */

import Vue from 'vue';
import $ from 'jquery';

import {
    Button,
    Row,
    Col,
    Input,
    Autocomplete,
}
from 'element-ui';
Vue.use(Button);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);
Vue.use(Autocomplete);

var com = {};
export default com;

com.components = {};

com.props = {
    xid: {
        type: String,
        default: 'SelectGroup',
    },
    conf: Object,
};

com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from dialog/SelectGroup/SelectGroup.js',
        schoolObj: {},
        groupObj: {},
        schoolArr: [],
        groupArr: [],
    };
};

com.methods = {
    clearSchool,
    clearGroup,
    getSchoolArr,
    schoolSelect,
    groupSelect,
};

com.mounted = async function () {
    var ctx = this;
    await ctx.getSchoolArr();

    //如果外部传来school和group，那么自动匹配下拉
    if (ctx.conf.schoolObj && ctx.conf.schoolObj._id && ctx.conf.schoolObj.name) {
        ctx.$set(ctx.$data, 'schoolObj', ctx.conf.schoolObj);
    };

    if (ctx.conf.groupObj && ctx.conf.groupObj._id && ctx.conf.groupObj.name) {
        ctx.$set(ctx.$data, 'groupObj', ctx.conf.groupObj);
    };
};

//--------------------------functions---------------------------

/**
 * 获取学校名称列表
 */
async function getSchoolArr() {
    var ctx = this;
    try {
        var api = ctx.$xglobal.conf.apis.schlGetSchoolArr;
        var data = {
            token: localStorage.getItem('accToken'),
        };

        var res = await ctx.rRun(api, data);
        var schoolArr = res.data;
        ctx.$set(ctx.$data, 'schoolArr', schoolArr);

    } catch (err) {
        ctx.$notify.error({
            title: '获取院校列表失败',
            message: err.tip || err.message,
        });
    };
};

/**
 * 清空院校输入框，弹出下拉
 */
async function clearSchool(evt) {
    var ctx = this;
    ctx.$set(ctx.$data, 'schoolObj', {});
    var iptjo = $(evt.target).parents('.el-row').find('input');
    setTimeout(function () {
        iptjo.focus();
    }, 200);
};

/**
 * 清空班级输入框，弹出下拉
 */
async function clearGroup(evt) {
    var ctx = this;
    ctx.$set(ctx.$data, 'groupObj', {});
    var iptjo = $(evt.target).parents('.el-row').find('input');
    setTimeout(function () {
        iptjo.focus();
    }, 200);
};


/**
 * 院校输入框下拉选择;同步刷新班级列表
 */
async function schoolSelect(sel) {
    var ctx = this;
    ctx.$set(ctx.$data, 'schoolObj', Object.assign({}, sel));

    try {
        var api = ctx.$xglobal.conf.apis.schlGetSchoolGroupArr;
        var data = {
            token: localStorage.getItem('accToken'),
            _id: sel._id,
        };

        var res = await ctx.rRun(api, data);
        var groupArr = res.data;
        ctx.$set(ctx.$data, 'groupArr', groupArr);

    } catch (err) {
        ctx.$notify.error({
            title: '获取院校列表失败',
            message: err.tip || err.message,
        });
    };
};

/**
 * 班级输入框下拉选择
 */
async function groupSelect(sel) {
    var ctx = this;
    ctx.$set(ctx.$data, 'groupObj', Object.assign({}, sel));
};


//--------------------------functions---------------------------




//
