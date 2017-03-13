/**
 * 注入到每个元素的方法，都应使用x开头
 * 应尽力避免注入过多的方法造成污染混乱，尽可能使用xglobal.fns
 */
import $ from 'jquery';
var methods = {};
export default methods;

methods.xtest = function () {
    console.log('>xglobal:methods:xtest:', this);
};

/**
 * 根据arr生成对应的查询函数
 * 为数组每一项增加value字段
 */
methods.xsearch = function (arr, key) {
    var ctx = this;
    if (key && arr) {
        arr.forEach(function (item) {
            item.value = item[key];
        });
    };
    return function (str, cb) {
        var results = str ? arr.filter(createQueryFilter(str)) : arr;
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
