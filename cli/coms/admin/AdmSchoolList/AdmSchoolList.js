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
Vue.use(Autocomplete);

var com = {};
export default com;

//所有直接用到的组件在这里导入
com.props = {
    xid: {
        type: String,
        default: 'AdmSchooolList',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from admin/getSchooolList/getSchooolList.js',
        schoolArr: [],
        provinceArr: [],
        cityArr: [],
        addDialogVis: false,
        addDialogData: {},
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
        },
    };
};

com.methods = {
    validate: function (ref) {
        this.$xglobal.fns.validate(this, ref);
    },
    getSchoolList,
    opeAddDialog,
    openEditDialog,
    dialogBtnClick,
    setParent,
    updateSchool,
    createQueryFilter,
    genSearchFn,
    selectCityName,
    selectSchoolName,
    selectProvinceName,
};

com.mounted = async function () {
    var ctx = this;
    await ctx.getSchoolList();
};


//--------------------------functions---------------------------


/**
 * 打开编辑院校信息弹窗
 */
async function openEditDialog(item) {
    var ctx = this;
    ctx.$set(ctx.$data, 'addDialogVis', true);
    ctx.$set(ctx.$data, 'addDialogMod', 'edit');
    ctx.$set(ctx.$data, 'addDialogData', item.row);
};

/**
 * 设定院校的父层院校
 */
function setParent(item) {
    var ctx = this;
    ctx.$set(ctx.$data.addDialogData, 'parent', item);
};

/**
 * 添加新院校
 */
async function dialogBtnClick() {
    var ctx = this;

    if (ctx.$data.addDialogMod == 'edit') {
        await ctx.updateSchool();
        return;
    };

    //先检查院校名称是否存在
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.school.find({name:'${ctx.$data.addDialogData.name}'})`,
    };

    var res = await ctx.rRun(api, data);

    if (res.data.length != 0) {
        ctx.$confirm('同名院校已经存在，是否覆盖?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(async function () {
            await ctx.updateSchool();
        }).catch(() => {});
    } else {
        await ctx.updateSchool();
    };
};

/**
 * 更新弹窗中的院校数据
 */
async function updateSchool() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var school = ctx.$data.addDialogData;

    if (!school.parent) school.parent = {
        _id: '58aff696582d98268a43852a'
    }; //指向未知院校

    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.school.update({name:'${school.name}'},{name:'${school.name}',parent:'${school.parent._id}',province:'${school.province}',city:'${school.city}',desc:'${school.desc}',_note:'${school._note}'},{upsert:true})`,
    };

    var res = await ctx.rRun(api, data);
    if (!res.err) {
        ctx.$set(ctx.$data, 'addDialogVis', false);
        ctx.getSchoolList();
    } else {
        ctx.$notify.error({
            title: `保存院校信息失败`,
            message: err.tip || err.message,
        });
    };
};


/**
 * 打开添加院校弹窗
 */
async function opeAddDialog(vis) {
    var ctx = this;
    ctx.$set(ctx.$data, 'addDialogVis', vis);
    ctx.$set(ctx.$data, 'addDialogMod', 'add');
    if (vis) ctx.$set(ctx.$data, 'addDialogData', {});
};


/**
 * 获取学校列表
 */
async function getSchoolList() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.school.find({},"").populate("parent").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);

    res.data.forEach(function (item) {
        item.value = item.name;
        if (ctx.$data.provinceArr.indexOf(item.province) == -1) {
            ctx.$data.provinceArr.push({
                value: item.province
            });
        };
        if (ctx.$data.cityArr.indexOf(item.city) == -1) {
            ctx.$data.cityArr.push({
                value: item.city
            });
        };
    });

    ctx.$set(ctx.$data, 'schoolArr', res.data);
}

/**
 * 输入框自动完成选择城市名称
 * @param {object} item object
 */
function selectCityName(item) {
    var ctx = this;
    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'city', item.value);
    setTimeout(function () {
        ctx.$set(ctx.$data.addDialogData, '_note', ctx.$data.addDialogData._note);
        ctx.$set(ctx.$data, 'addDialogData', ctx.$data.addDialogData);
    }, 100);
};

/**
 * 输入框自动完成选择院校名称
 * @param {object} item object
 */
function selectProvinceName(item) {
    var ctx = this;
    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'province', item.value);
    setTimeout(function () {
        ctx.$set(ctx.$data.addDialogData, '_note', ctx.$data.addDialogData._note);
        ctx.$set(ctx.$data, 'addDialogData', ctx.$data.addDialogData);
    }, 100);
};

/**
 * 输入框自动完成选择院校名称
 * @param {object} item object
 */
function selectSchoolName(item) {
    var ctx = this;
    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'name', item.value);
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
