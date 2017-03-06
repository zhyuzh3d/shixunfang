/**
 * 账号管理登录注册弹窗
 */

import Vue from 'vue';
import $ from 'jquery';
import md5 from 'md5';

import {
    Input,
    Table,
    TableColumn,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DatePicker,
    Autocomplete,
}
from 'element-ui'
Vue.use(Input);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Button);
Vue.use(Dropdown);
Vue.use(DropdownItem);
Vue.use(DropdownMenu);
Vue.use(DatePicker);
Vue.use(Autocomplete);

var com = {};
export default com;

//所有直接用到的组件在这里导入
com.props = {
    xid: {
        type: String,
        default: 'AdmPlanList',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;

    var itemDefault = {
        school: {},
        group: {},
        course: {},
        manager: {},
        teachers: [],
        assistants: [],
    };

    return {
        msg: 'Hello from admin/AdmPlanList/AdmPlanList.js',
        itemArr: [],
        dialogSchool: {},
        schoolArr: [],
        groupArr: [],
        courseArr: [],
        categoryArr: ctx.$xglobal.conf.set.taskCategoryArr,
        addDialogCategory: undefined,

        addDialogVis: false,
        addDialogDefault: itemDefault,
        addDialogData: itemDefault,
        addDialogBegin: undefined,
        addDialogEnd: undefined,


        dialogBegin: undefined, //弥补el时间选择器不能自动刷新的问题
        dialogEnd: undefined,
        addDialogTeacher: {}, //弹窗老师对象
        addDialogAssistant: {}, //弹窗助理对象
        addDialogMod: 'add',
        validates: {
            addDialogTitle: {
                fn: /^[\s\S]{3,24}$/,
                tip: '任意3～24位字符'
            },
            addDialogProvince: {
                fn: /^[\s\S]{2,4}$/,
                tip: '简称2~4字符'
            },
            addDialogCity: {
                fn: /^[\s\S]{2,8}$/,
                tip: '简称2~8字符'
            },
            addDialogDesc: {
                fn: /^[\s\S]{0,512}$/,
                tip: '任意0~256字符'
            },
            addDialogNote: {
                fn: /^[\s\S]{0,256}$/,
                tip: '任意0~256字符'
            },
            addDialogMobile1: {
                fn: /^1\d{10}$/,
                tip: '11位数字手机号码'
            },
            addDialogMobile2: {
                fn: /^1\d{10}$/,
                tip: '11位数字手机号码'
            },
            addDialogMobile3: {
                fn: /^1\d{10}$/,
                tip: '11位数字手机号码'
            },
        },
    };
};

com.methods = {
    validate: async function (ref, key) {
        this.$xglobal.fns.validate(this, ref);
    },
    getItemArr,
    getSchoolArr,
    selectSchool,
    selelctGroup,
    selectCategory,
    selectCourse,
    refreshDialogData,
    genSearchFn,
    getSchoolList,
    opeAddDialog,
    openEditDialog,
    updateItem,
    createQueryFilter,
    addTeacher,
    addAssistant,
    removeTeacher,
    removeAssistant,
    iptMobileChange,
};

com.mounted = async function () {
    var ctx = this;
    await ctx.getItemArr();
};


//--------------------------functions---------------------------


/**
 * 弹窗中选择课程
 */
async function selectCourse(item) {
    var ctx = this;
    if (!item) return;
    ctx.$set(ctx.$data.addDialogData, 'course', item);
    ctx.refreshDialogData();
};

/**
 * 弹窗中选择课程类别
 */
async function selectCategory(item) {
    var ctx = this;
    if (!item) return;
    ctx.$set(ctx.$data, 'addDialogCategory', item);

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.course.find({category:'${item}'},"title").sort({created_at:-1})`,
    };
    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'courseArr', res.data);
};

/**
 * 弹窗中选择班级
 */
async function selelctGroup(item) {
    var ctx = this;
    if (!item._id) return;
    ctx.$set(ctx.$data.addDialogData, 'group', item);
};

/**
 * 弹窗中选择院校;根据院校获取班级列表
 */
async function selectSchool(item) {
    var ctx = this;
    if (!item._id) return;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.group.find({school:'${item._id}'},"name").sort({created_at:-1})`,
    };
    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'groupArr', res.data);
};


/**
 * 拉取学校列表
 */
async function getSchoolArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.school.find({},"name").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'schoolArr', res.data);
};


/**
 * 获取班级列表
 */
async function getItemArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.plan.find({},"").populate("author","name mobile").populate({path:"group",select:"name school",populate:{path:"school",select:"name"}}).populate("course","title").populate("manager","name mobile").populate("teachers","name mobile").populate("assistants","name mobile").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'itemArr', res.data);
};





/**
 * 打开编辑院校信息弹窗
 */
async function openEditDialog(item) {
    var ctx = this;
    await ctx.getSchoolArr();

    ctx.$set(ctx.$data, 'addDialogData', item.row);

    if (!item.row.manager) ctx.$data.addDialogData.manager = {};
    if (!item.row.teacher) ctx.$data.addDialogData.teacher = {};
    if (!item.row.assistant) ctx.$data.addDialogData.assistant = {};

    ctx.$set(ctx.$data, 'addDialogVis', true);
    ctx.$set(ctx.$data, 'addDialogMod', 'edit');
};

/**
 * 打开添加院校弹窗
 */
async function opeAddDialog(vis) {
    var ctx = this;
    await ctx.getSchoolArr();

    if (vis) ctx.$set(ctx.$data, 'addDialogData', ctx.$data.addDialogDefault);

    ctx.$set(ctx.$data, 'addDialogVis', vis);
    ctx.$set(ctx.$data, 'addDialogMod', 'add');
};

/**
 * 刷新弹窗数据
 */
function refreshDialogData() {
    var ctx = this;
    var ddata = ctx.$data.addDialogData;
    setTimeout(function () {
        var desc = ddata.desc;
        ctx.$set(ddata, 'desc', '--');
        ctx.$set(ddata, 'desc', desc);
        ctx.$set(ctx.$data, 'addDialogData', ddata);
    }, 100);
};


/**
 * 弹窗添加老师按钮
 * 先添加到adddialogdata.teachers，update的时候再整理
 */
async function addAssistant() {
    var ctx = this;
    var usr = ctx.$data.addDialogAssistant;
    if (!usr._id) {
        ctx.$notify.error({
            title: 'ID未定义!',
        });
    };

    var arr = ctx.$data.addDialogData.assistants;
    var exist = arr.filter(function (v) {
        return v._id == usr._id;
    });

    if (exist.length == 0) {
        arr.push(usr);
        ctx.$set(ctx.$data.addDialogData, 'assistants', arr);
        ctx.$set(ctx.$data, 'addDialogAssistant', {});
    } else {
        ctx.$notify.error({
            title: '已经存在，请勿重复添加!',
        });
    };
};

/**
 * 弹窗删除老师按钮
 * 从adddialogdata.teachers中移除，update的时候再整理
 */
async function removeAssistant(usr) {
    var ctx = this;
    var arr = ctx.$data.addDialogData.assistants;
    var pos = arr.indexOf(usr);
    if (pos != -1) arr.splice(pos, 1);
    ctx.$set(ctx.$data.addDialogData, 'assistants', arr);
};

/**
 * 通用的手机输入框监听，自动读取用户名更新
 * @param {string} usrkey 用户对象在$data中的数据字段，_id和name自动填充到这里
 * @param {string} ref    用于validate的验证ref
 */
async function iptMobileChange(usrkey, ref, pathObj) {
    var ctx = this;
    var obj = pathObj ? pathObj : ctx.$data;

    ctx.$set(obj, usrkey, {
        mobile: obj[usrkey].mobile
    }); //清空id和name字段

    if (ref) {
        var vali = ctx.$xglobal.fns.validate(ctx, ref);
        if (!vali) return;
    };

    var usr = obj[usrkey];
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.user.findOne({mobile:'${usr.mobile}'},'_id name')`,
    };

    var res = await ctx.rRun(api, data);
    if (!res.data) return;

    usr._id = res.data._id;
    usr.name = res.data.name;
    ctx.$set(obj, usrkey, usr);
    ctx.refreshDialogData();
};


/**
 * 弹窗添加老师按钮
 * 先添加到adddialogdata.teachers，update的时候再整理
 */
async function addTeacher() {
    var ctx = this;
    var usr = ctx.$data.addDialogTeacher;
    if (!usr._id) {
        ctx.$notify.error({
            title: 'ID未定义!',
        });
    };

    var arr = ctx.$data.addDialogData.teachers;
    var exist = arr.filter(function (v) {
        return v._id == usr._id;
    });

    if (exist.length == 0) {
        arr.push(usr);
        ctx.$set(ctx.$data.addDialogData, 'teachers', arr);
        ctx.$set(ctx.$data, 'addDialogTeacher', {});
    } else {
        ctx.$notify.error({
            title: '已经存在，请勿重复添加!',
        });
    };
};

/**
 * 弹窗删除老师按钮
 * 从adddialogdata.teachers中移除，update的时候再整理
 */
async function removeTeacher(usr) {
    var ctx = this;
    var arr = ctx.$data.addDialogData.teachers;
    var pos = arr.indexOf(usr);
    if (pos != -1) arr.splice(pos, 1);
    ctx.$set(ctx.$data.addDialogData, 'teachers', arr);
};



/**
 * 更新弹窗中的班级数据
 */
async function updateItem() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var item = ctx.$data.addDialogData;

    if (ctx.$data.dialogBegin) item.begin = ctx.$data.dialogBegin;
    if (ctx.$data.dialogEnd) item.end = ctx.$data.dialogEnd;

    var datStr = `{title:'${item.title}',desc:'${item.desc}',_note:'${item._note}'`;

    if (ctx.addDialogBegin) datStr += `,begin:'${ctx.addDialogBegin}'`;
    if (ctx.addDialogEnd) datStr += `,end:'${ctx.addDialogEnd}'`;
    if (item.manager._id) datStr += `,manager:'${item.manager._id}'`;
    if (item.group._id) datStr += `,group:'${item.group._id}'`;
    if (item.course._id) datStr += `,course:'${item.course._id}'`;

    var teachersIdArr = []; //转换id数组
    item.teachers.forEach(function (item) {
        teachersIdArr.push(item._id);
    });
    datStr += `,teachers:${JSON.stringify(teachersIdArr)}`;


    var assistantsIdArr = []; //转换id数组
    item.assistants.forEach(function (item) {
        assistantsIdArr.push(item._id);
    });
    datStr += `,assistants:${JSON.stringify(assistantsIdArr)}`;

    datStr += '}';

    var cmd;
    if (ctx.$data.addDialogData._id) {
        cmd = `models.plan.update({_id:'${item._id}'},${datStr},{upsert:true})`;
    } else {
        cmd = `models.plan(${datStr}).save()`;
    };

    var data = {
        token: localStorage.getItem('accToken'),
        cmd: cmd,
    };

    var res = await ctx.rRun(api, data);
    if (!res.err) {
        ctx.$set(ctx.$data, 'addDialogVis', false);
        ctx.getItemArr();
    } else {
        ctx.$notify.error({
            title: `保存方案信息失败`,
            message: err.tip || err.message,
        });
    };
};

/**
 * 获取学校名称列表
 */
async function getSchoolList() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.school.find({},"name")',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'schoolArr', res.data);
}









/**
 * 根据arr生成对应的查询函数
 * 为数组每一项增加value字段
 */
function genSearchFn(arr, key) {
    var ctx = this;
    if (key && arr) {
        arr.forEach(function (item) {
            item.value = item[key];
        });
    };
    return function (str, cb) {
        var results = str ? arr.filter(ctx.createQueryFilter(str)) : arr;
        cb(results);
    };
};

/**
 * 用于搜索框查询使用的函数
 * @param   {string}   str str
 * @returns {boolean} 1/0
 */
function createQueryFilter(str) {
    return function (item) {
        return item.value.toLowerCase().indexOf(str.toLowerCase()) === 0;
    };
};


//
