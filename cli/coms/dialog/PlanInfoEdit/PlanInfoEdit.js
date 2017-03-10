/**
 * 账号管理登录注册弹窗
 */

import Vue from 'vue';
import $ from 'jquery';

import {
    Input,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DatePicker,
    Autocomplete,
}
from 'element-ui'
Vue.use(Input);
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
        default: 'PlanInfoEdit',
    },
    fill: {
        type: Object,
        default: function () {
            return {}
        },
    },
    mod: {
        type: String,
        default: 'edit',
    },
};

//所有数据写在这里
com.data = function data() {
    var ctx = this;

    return {
        msg: 'Hello from dialog/PlanInfoEdit/PlanInfoEdit.js',
        categoryArr: ctx.$xglobal.conf.set.taskCategoryArr,
        courseArr: [],
        validates: {
            title: {
                fn: /^[\s\S]{3,24}$/,
                tip: '任意3～24位字符'
            },
            desc: {
                fn: /^[\s\S]{0,512}$/,
                tip: '任意0～512位字符'
            },
        },
    };
};

com.methods = {
    selectCategory,
    selectCourse,
    validate,
};

com.mounted = async function () {
    var ctx = this;
    ctx.xsearch();
};


//--------------------------functions---------------------------

/**
 * 弹窗中选择课程类别,根据类别拉取课程名称列表courseArr
 */
async function selectCourse(item) {
    var ctx = this;
    if (!item) return;
    ctx.$set(ctx.fill, 'course', JSON.parse(item));
};

/**
 * 弹窗中选择课程类别,根据类别拉取课程名称列表courseArr
 */
async function selectCategory(item) {
    var ctx = this;
    if (!item) return;

    var api = ctx.$xglobal.conf.apis.crsGetAllCourse;
    var data = {
        category: item,
    };
    var res = await ctx.rRun(api, data);
    ctx.$set(ctx.$data, 'courseArr', res.data);
    ctx.$set(ctx.fill, 'category', item);
};

/**
 * 用于输入验证的函数
 */
async function validate(ref, key) {
    this.$xglobal.fns.validate(this, ref);
};





//------------------base functions-------------------


//
