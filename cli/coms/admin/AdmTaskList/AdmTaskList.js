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
    Notification,
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
const notify = Notification;
Vue.prototype.$notify = notify;

var com = {};
export default com;

//所有直接用到的组件在这里导入
com.props = {
    xid: {
        type: String,
        default: 'AdmTaskList',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from admin/AdmTaskList/AdmTaskList.js',
        taskArr: [],
        cateTaskArr: [],
        cateTagArr: [],
        cateTitleArr: [],
        typesObj: ctx.$xglobal.conf.set.taskTypesObj,
        submitTypesObj:ctx.$xglobal.conf.set.submitTypesObj,
        categoryArr: ctx.$xglobal.conf.set.taskCategoryArr,
        addDialogVis: false,
        addDialogData: {},
        addDialogMod: 'add',
        addDialogTag: undefined,
        validates: {
            addDialogTitle: {
                fn: /^[\s\S]{3,128}$/,
                tip: '任意3～128位字符'
            },
            addDialogTags: {
                fn: /^[\s\S]{0,256}$/,
                tip: '任意0～256位字符串数组,空格分开'
            },
            addDialogLink: {
                fn: /^[\s\S]{4,512}$/,
                tip: '任意4～512位字符串数组'
            },
            addDialogDesc: {
                fn: /^[\s\S]{0,512}$/,
                tip: '任意0~512字符'
            },
            addDialogTag: {
                fn: /^[\s\S]{2,32}$/,
                tip: '任意2~12字符'
            },
        },
    };
};

com.methods = {
    validate: async function (ref, key) {
        this.$xglobal.fns.validate(this, ref);
    },
    getTaskArr,
    opeAddDialog,
    openEditDialog,
    dialogBtnClick,
    updateItem,
    selectCategory,
    selectType,
    selectTitle,
    selectTag,
    selectSubmit,
    addTag,
    removeTag,
    genSearchFn,
    createQueryFilter,
    refreshDialogData,
};

com.mounted = async function () {
    var ctx = this;
    await getTaskArr.call(ctx);
};


//--------------------------functions---------------------------


/**
 * 刷新弹窗数据
 */
function refreshDialogData() {
    var ctx = this;
    var ddata = ctx.$data.addDialogData;
    setTimeout(function () {
        var desc = ddata.desc;
        ctx.$set(ddata, 'desc', '');
        ctx.$set(ddata, 'desc', desc);
        ctx.$set(ctx.$data, 'addDialogData', ddata);
    }, 100);
};

/**
 * 将一个标签从addDialogData.tags数组中移除
 */
function removeTag(tag) {
    var ctx = this;
    var ddata = ctx.$data.addDialogData;

    var pos = ddata.tags.indexOf(tag);
    ddata.tags.splice(pos, 1);
    ctx.$set(ctx.$data.addDialogData, 'tags', ddata.tags);
    ctx.refreshDialogData();
};


/**
 * 将一个标签添加到addDialogData.tags数组
 */

function addTag() {
    var ctx = this;
    var ddata = ctx.$data.addDialogData;
    var tag = ctx.$data.addDialogTag;

    if (!ddata.tags) ddata.tags = [];

    if (ddata.tags.indexOf(tag) == -1) {
        ddata.tags.push(tag);
    };

    ctx.$set(ddata, 'tags', ddata.tags);
    ctx.refreshDialogData();
    ctx.$set(ctx.$data, 'addDialogTag', undefined);
};

/**
 * 下拉选择类别
 */
async function selectCategory(str) {
    var ctx = this;
    ctx.$set(ctx.$data.addDialogData, 'category', str);

    //从后端读取该类别下的所有标题
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.task.find({category:"${str}"},"title tags")`,
    };

    var res = await ctx.rRun(api, data);

    //梳理所有此类别下的标签
    var tagArr = [];
    var titleArr = [];

    res.data.forEach(function (item) {
        titleArr.push({
            value: item.title,
            _id: item._id,
        });
        item.tags.forEach(function (t) {
            var it = {
                value: t
            };
            if (tagArr.indexOf(it) == -1) tagArr.push(it);
        });
    });
    ctx.$set(ctx.$data, 'cateTitleArr', titleArr);
    ctx.$set(ctx.$data, 'cateTagArr', tagArr);
};

/**
 * 标题自动完成的下拉菜单选择
 */
function selectTitle(item) {
    var ctx = this;
    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'title', item.value);
    ctx.refreshDialogData();
};

/**
 * 标题自动完成的下拉菜单选择
 */
function selectTag(item) {
    var ctx = this;
    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data, 'addDialogTag', item.value);
    ctx.refreshDialogData();
};

/**
 * 任务类型自动完成的下拉菜单选择
 */
function selectType(key) {
    var ctx = this;

    //根据形式确定通过标准
    ctx.$set(ctx.$data.addDialogData, 'pass', ctx.$data.typesObj[key].pass);

    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'type', key);
    ctx.refreshDialogData();
};

/**
 * 提交格式自动完成的下拉菜单选择
 */
function selectSubmit(key) {
    var ctx = this;

    //只有先更新其他才能实现更新
    ctx.$set(ctx.$data.addDialogData, 'submitType', key);
    ctx.refreshDialogData();
};

/**
 * 获取任务列表
 */
async function getTaskArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.task.find({},"").populate("author","name mobile").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'taskArr', res.data);
};


/**
 * 打开编辑院校信息弹窗
 */
async function openEditDialog(item) {
    var ctx = this;

    ctx.$set(ctx.$data, 'addDialogData', item.row);
    ctx.selectCategory(item.row.category);
    ctx.$set(ctx.$data, 'addDialogVis', true);
    ctx.$set(ctx.$data, 'addDialogMod', 'edit');
};

/**
 * 打开添加院校弹窗
 */
async function opeAddDialog(vis) {
    var ctx = this;

    if (vis) ctx.$set(ctx.$data, 'addDialogData', {});
    ctx.$set(ctx.$data, 'addDialogVis', vis);
    ctx.$set(ctx.$data, 'addDialogMod', 'add');
};

/**
 * 添加／修改新任务
 */
async function dialogBtnClick() {
    var ctx = this;
    await ctx.updateItem();
};


/**
 * 更新弹窗中的班级数据
 */
async function updateItem() {
    var ctx = this;
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var item = ctx.$data.addDialogData;

    if (!item.author) item.author = {
        _id: ctx.$xglobal.accInfo._id,
    };

    if (!item.category) {
        ctx.$notify.error({
            title: '必须选择类别!',
        });
        return;
    };

    if (!item.type) {
        ctx.$notify.error({
            title: '必须选择形式!',
        });
        return;
    };

    if (!item.submitType) {
        ctx.$notify.error({
            title: '必须选择提交格式!',
        });
        return;
    };


    var datStr = `{category:'${item.category}',title:'${item.title}',type:'${item.type}',submitType:'${item.submitType}',author:'${item.author._id}',desc:'${item.desc}'`;

    if (item.link) datStr += `,link:'${item.link}'`;
    if (item.tags) datStr += `,tags:${JSON.stringify(item.tags)}`;

    datStr += '}';

    var cmd;
    if (ctx.$data.addDialogData._id) {
        cmd = `models.task.update({_id:'${item._id}'},${datStr},{upsert:true})`;
    } else {
        cmd = `models.task(${datStr}).save()`;
    };

    var data = {
        token: localStorage.getItem('accToken'),
        cmd: cmd,
    };

    var res = await ctx.rRun(api, data);
    if (!res.err) {
        ctx.$set(ctx.$data, 'addDialogVis', false);
        ctx.getTaskArr();
    } else {
        ctx.$notify.error({
            title: `保存任务信息失败`,
            message: err.tip || err.message,
        });
    };
};


/**
 * 根据arr生成对应的查询函数
 * 为数组每一项增加value字段
 */
function genSearchFn(arrkey, key) {
    var ctx = this;

    if (key) {
        arr.forEach(function (item) {
            item.value = item[key];
        });
    };

    return function (str, cb) {
        var arr = ctx.$data[arrkey];
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
        return item.value.toLowerCase().indexOf(str.toLowerCase()) != -1;
    };
};


//
