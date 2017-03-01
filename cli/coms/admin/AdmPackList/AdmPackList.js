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
        default: 'AdmPackList',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;
    return {
        msg: 'Hello from admin/AdmPackList/AdmPackList.js',
        packArr: [],
        cateTaskArr: [],
        cateTagArr: [],
        cateTitleArr: [],
        typesObj: ctx.$xglobal.conf.set.taskTypesObj,
        categoryArr: ctx.$xglobal.conf.set.taskCategoryArr,
        addDialogVis: false,
        addDialogData: {},
        addDialogMod: 'add',
        addDialogTag: undefined,
        addDialogTask: undefined,
        addDialogTasks: [],
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
            addDialogTask: {
                fn: /^[\s\S]{2,128}$/,
                tip: '输入搜索，下拉添加'
            },
        },
    };
};

com.methods = {
    validate: async function (ref, key) {
        this.$xglobal.fns.validate(this, ref);
    },
    getPackArr,
    opeAddDialog,
    openEditDialog,
    dialogBtnClick,
    updateItem,
    selectCategory,
    selectType,
    selectTitle,
    selectTag,
    selectTask,
    addTag,
    removeTag,
    removeTask,
    genSearchFn,
    createQueryFilter,
    refreshDialogData,
};

com.mounted = async function () {
    var ctx = this;
    await getPackArr.call(ctx);
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
 * 将一个任务从addDialogData.tasks数组中移除
 */
function removeTask(task) {
    var ctx = this;
    var ddata = ctx.$data.addDialogData;

    var pos = ddata.tasks.indexOf(task._id);
    ddata.tasks.splice(pos, 1);
    ctx.$set(ctx.$data.addDialogData, 'tasks', ctx.$data.addDialogData.tasks);

    var arr = [];
    ctx.$data.addDialogTasks.forEach(function (item) {
        if (item._id != task._id) arr.push(item);
    });
    ctx.$set(ctx.$data, 'addDialogTasks', arr);


    ctx.refreshDialogData();
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
    if (!tag) return;

    if (!ddata.tags) ddata.tags = [];

    if (ddata.tags.indexOf(tag) == -1) {
        ddata.tags.push(tag);
    };

    ctx.$set(ddata, 'tags', ddata.tags);
    ctx.refreshDialogData();
    ctx.$set(ctx.$data, 'addDialogTag', undefined);
};

/**
 * 下拉选择类别,拉取该任务下的全部任务标题
 */
async function selectCategory(str) {
    var ctx = this;
    ctx.$set(ctx.$data.addDialogData, 'category', str);

    //从后端读取该类别下的所有标题
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.pack.find({category:"${str}"},"title tags")`,
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
            var exist = tagArr.filter(function (v) {
                return v.value == t;
            });

            if (exist.length == 0) tagArr.push({
                value: t
            });
        });
    });
    ctx.$set(ctx.$data, 'cateTitleArr', titleArr);
    ctx.$set(ctx.$data, 'cateTagArr', tagArr);

    //拉取任务标题
    var api2 = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data2 = {
        token: localStorage.getItem('accToken'),
        cmd: `models.task.find({category:"${str}"},"title tags")`,
    };

    var res2 = await ctx.rRun(api2, data2);
    var taskArr = [];
    res2.data.forEach(function (item) {
        taskArr.push({
            title: item.title,
            value: item.title,
            _id: item._id,
        });
    });
    ctx.$set(ctx.$data, 'cateTaskArr', taskArr);
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
 * 任务自动完成的下拉菜单选择；
 * 由addDialogTask和addDialogTasks共同维护.tasks数组id
 */
function selectTask(item) {
    var ctx = this;
    if (!ctx.$data.addDialogData.tasks) ctx.$data.addDialogData.tasks = [];
    var tasks = ctx.$data.addDialogData.tasks;

    //只有先更新其他才能实现更新
    if (tasks.indexOf(item._id) == -1) {
        tasks.push(item._id);
        ctx.$data.addDialogTasks.push(item);
        ctx.$set(ctx.$data, 'addDialogTasks', ctx.$data.addDialogTasks);
        ctx.$set(ctx.$data.addDialogData, 'tasks', ctx.$data.addDialogData.tasks);
    };
    ctx.$set(ctx.$data, 'addDialogTask', undefined); //清空输入框

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
 * 标题自动完成的下拉菜单选择
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
 * 获取任务列表
 */
async function getPackArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.pack.find({},"").populate("author","name mobile").populate("tasks","title").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'packArr', res.data);
};


/**
 * 打开编辑院校信息弹窗
 */
async function openEditDialog(item) {
    var ctx = this;

    ctx.$set(ctx.$data, 'addDialogData', item.row);

    ctx.$set(ctx.$data, 'addDialogTasks', item.row.tasks); //计算addDialogTasks
    ctx.selectCategory(item.row.category); //更新类别

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

    if (ctx.$data.addDialogMod == 'edit') {
        await ctx.updateItem();
        return;
    };

    //先检查班级名称是否存在
    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: `models.school.find({name:'${ctx.$data.addDialogData.name}'})`,
    };

    var res = await ctx.rRun(api, data);
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

    if (!item.type) item.type = '未知';

    var datStr = `{category:'${item.category}',title:'${item.title}',author:'${item.author._id}',desc:'${item.desc}'`;

    if (item.tags) datStr += `,tags:${JSON.stringify(item.tags)}`;
    if (item.tasks) datStr += `,tasks:${JSON.stringify(item.tasks)}`;

    datStr += '}';

    var cmd;
    if (ctx.$data.addDialogData._id) {
        cmd = `models.pack.update({_id:'${item._id}'},${datStr},{upsert:true})`;
    } else {
        cmd = `models.pack(${datStr}).save()`;
    };

    var data = {
        token: localStorage.getItem('accToken'),
        cmd: cmd,
    };

    var res = await ctx.rRun(api, data);
    if (!res.err) {
        ctx.$set(ctx.$data, 'addDialogVis', false);
        ctx.getPackArr();
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
