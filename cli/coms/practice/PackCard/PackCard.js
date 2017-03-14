import Vue from 'vue'
import $ from 'jquery';
import Moment from 'moment';
Moment.locale('zh-cn');

var com = {};
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
};

com.mounted = function () {};


//----------------------------functions----------------------








//
