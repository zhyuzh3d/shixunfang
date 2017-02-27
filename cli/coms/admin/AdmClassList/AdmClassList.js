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
        default: 'AdmClassList',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from admin/AdmClassList/AdmClassList.js',
        groupArr: [],
        schoolArr: [],
        addDialogVis: false,
        addDialogData: {
            manager: {},
            teacher: {},
            assistant: {},
        },
        dialogBegin: undefined, //弥补el时间选择器不能自动刷新的问题
        dialogEnd: undefined,
        addDialogMod: 'add',
        validates: {
            addDialogName: {
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
        await this.setDialogUser(key);
    },
    getGroupList,
    getSchoolList,
    opeAddDialog,
    openEditDialog,
    dialogBtnClick,
    setSchool,
    updateGroup,
    updateYear,
    createQueryFilter,
    genSearchFn,
    selectGroupName,
    setDialogUser,
};

com.mounted = async function () {
    var ctx = this;
    await getGroupList.call(ctx);
};


//--------------------------functions---------------------------

/**
 * 根据输入的电话号码兑换用户名称和id
 * @param {string} key 字段名manager,teacher,assistant
 */
async function setDialogUser(key) {
    var ctx = this;
    if (!key) return;

    var usr = ctx.$data.addDialogData[key];

    if (!usr.mobile || usr.mobile.length != 11) {
        ctx.$set(usr, 'name', undefined);
        usr._id = undefined;
        return;
    };

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.user.findOne({mobile:'${usr.mobile}'},'_id name mobile')`,
    };

    var res = await ctx.rRun(api, data);

    if (res.data) {
        ctx.$set(usr, 'name', res.data.name);
        ctx.$set(usr, 'mobile', res.data.mobile);
        setTimeout(function () {
            var note = ctx.$data.addDialogData._note;
            ctx.$set(ctx.$data.addDialogData, '_note', '');
            ctx.$set(ctx.$data.addDialogData, '_note', note);
            ctx.$set(ctx.$data, 'addDialogData', ctx.$data.addDialogData);
        }, 100);
        usr._id = res.data._id;
    };
};


/**
 * 打开编辑院校信息弹窗
 */
async function openEditDialog(item) {
    var ctx = this;
    await ctx.getSchoolList();

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
    await ctx.getSchoolList();

    if (vis) ctx.$set(ctx.$data, 'addDialogData', {
        manager: {},
        teacher: {},
        assistant: {},
    });

    ctx.$set(ctx.$data, 'addDialogVis', vis);
    ctx.$set(ctx.$data, 'addDialogMod', 'add');
};

/**
 * 设定院校的父层院校
 */
function setSchool(item) {
    var ctx = this;
    ctx.$set(ctx.$data.addDialogData, 'school', item);
};

/**
 * 添加新院校
 */
async function dialogBtnClick() {
    var ctx = this;

    if (ctx.$data.addDialogMod == 'edit') {
        await ctx.updateGroup();
        return;
    };

    //先检查班级名称是否存在
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.school.find({name:'${ctx.$data.addDialogData.name}'})`,
    };

    var res = await ctx.rRun(api, data);

    if (res.data.length != 0) {
        var ipt = await ctx.$confirm('同名班级已经存在，是否覆盖?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        if (ipt) await ctx.updateGroup();
    } else {
        await ctx.updateGroup();
    };
};

/**
 * 更新弹窗中的班级数据
 */
async function updateGroup() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var group = ctx.$data.addDialogData;

    if (ctx.$data.dialogBegin) group.begin = ctx.$data.dialogBegin;
    if (ctx.$data.dialogEnd) group.end = ctx.$data.dialogEnd;

    if (!group.school) group.school = {
        _id: '58aff696582d98268a43852a'
    };

    var datStr = `{name:'${group.name}',school:'${group.school._id}',desc:'${group.desc}',_note:'${group._note}'`;

    if (group.begin) datStr += `,begin:'${group.begin}'`;
    if (group.end) datStr += `,end:'${group.end}'`;
    if (group.manager._id) datStr += `,manager:'${group.manager._id}'`;
    if (group.teacher._id) datStr += `,teacher:'${group.teacher._id}'`;
    if (group.assistant._id) datStr += `,assistant:'${group.assistant._id}'`;

    datStr += '}';

    var cmd;
    if (ctx.$data.addDialogData._id) {
        cmd = `models.group.update({_id:'${group._id}'},${datStr},{upsert:true})`;
    } else {
        cmd = `models.group(${datStr}).save()`;
    };

    var data = {
        token: localStorage.getItem('accToken'),
        cmd: cmd,
    };

    //manager:'${group.manager._id}',teacher:'${group.teacher._id}',assistant:'${group.assistant._id}',
    //,begin:'${group.begin}',end:'${group.end}'

    var res = await ctx.rRun(api, data);
    if (!res.err) {
        ctx.$set(ctx.$data, 'addDialogVis', false);
        ctx.getGroupList();
    } else {
        ctx.$notify.error({
            title: `保存院校信息失败`,
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
 * 获取班级列表
 */
async function getGroupList() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.group.find({},"").populate("school","name mobile").populate("manager","name mobile").populate("teacher","name mobile").populate("assistant","name mobile").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'groupArr', res.data);
};

/**
 *  强制刷新对话框中的年份
 */
function updateYear() {
    var ctx = this;
    ctx.$set(ctx.addDialogData, 'begin', ctx.addDialogData.begin);
    ctx.$set(ctx.addDialogData, 'end', ctx.addDialogData.end);
};

/**
 * 输入框自动完成选择班级名称
 * @param {object} item object
 */
function selectGroupName(item) {
    var ctx = this;
    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'province', item.value);
    setTimeout(function () {
        ctx.$set(ctx.$data.addDialogData, '_note', ctx.$data.addDialogData._note);
        ctx.$set(ctx.$data, 'addDialogData', ctx.$data.addDialogData);
    }, 100);
};



/**
 * 根据arr生成对应的查询函数
 * 为数组每一项增加value字段
 */
function genSearchFn(arr, key) {
    var ctx = this;
    if (key) {
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
