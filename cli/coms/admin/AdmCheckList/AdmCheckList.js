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
        default: 'AdmCheckList',
    },
    conf: Object,
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;

    return {
        msg: 'Hello from admin/AdmCheckList/AdmCheckList.js',
        itemArr: [],
        categoryArr: ctx.$xglobal.conf.set.taskCategoryArr,
        validates: {},
    };
};

com.methods = {
    validate: async function (ref, key) {
        this.$xglobal.fns.validate(this, ref);
    },
    getItemArr,
    genSearchFn,
    createQueryFilter,
};

com.mounted = async function () {
    var ctx = this;
    await ctx.getItemArr();
};


//--------------------------functions---------------------------


/**
 * 获取班级列表
 */
async function getItemArr() {
    var ctx = this;

    var api = ctx.$xglobal.conf.apis.admRunMngsCmd;
    var data = {
        token: localStorage.getItem('accToken'),
        cmd: 'models.check.find({},"state pass").populate("case","title").populate("task","title category").populate("author","name").sort({created_at:-1})',
    };

    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'itemArr', res.data);
};


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
