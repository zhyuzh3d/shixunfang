//主战入口文件，将自动载入子站并完成vue和插件的初始化
import Vue from 'vue';
import './conf/common.css'; //自定义样式

//elements ui主题库
/*
import './theme/index.css';
import ElementUI from 'element-ui';
Vue.use(ElementUI);
*/

//响应式窗口宽度查询
import xmedia from './plugins/xmedia.js';
Vue.use(xmedia)

//xglobal全局插件及载入设置
import conf from './xglobal/conf.js';
import fns from './xglobal/fns.js';
import rRun from './xglobal/rRun.js';
import xglobal from './plugins/xglobal.js';

var xoption = {
    xglobal: {
        //将通过beforCreate附着到组件的this，任意字段
        conf,
        fns, //包含多个函数的object
        xdata: {},
    },
    xcomponent: {
        //将附着到每个组件，可以使用data，methods等字段
        methods: { //只能使用单个函数
            rRun,
        },
        data: function () {
            return {};
        },
    },
};

//添加所有注入方法
import methods from './xglobal/methods.js';
for (var key in methods) {
    xoption.xcomponent.methods[key] = methods[key];
};

Vue.use(xglobal, xoption);

//xrouter路由插件
import xrouter from './plugins/xrouter.js';
Vue.use(xrouter);


//初始化vue,使用App组件开始
import App from './coms/pages/App/App.html';

var app = new Vue({
    el: '#VueApp', //挂载点
    render: function (h) {
        return h(App);
    }
});
