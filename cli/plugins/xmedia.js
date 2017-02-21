/**
 * 注册一个v-xmedia指令，可以等于xs-sm-md-lg任意组合进行查询
 * 注意v-xmedia='xs'或v-xmedia='md-xs'；但不要使用空格'md xs'，会报错
 * 满足查询则显示，不满足则隐藏；
 * 基于display:none；不要和v-show一起用
 * 窗口大小查询xs,sm,md,lg与element-ui保持一致
 * 同时提供实时的Vue.$xmedia对象{tag,gt(str),st(str)};
 */

var xmedia = {};
export default xmedia;

/**
 * 插件初始化安装
 * 向每个元件注入$xmedia(str)方法
 */
xmedia.install = function (Vue) {

    var set = {
        xs: 0,
        sm: 768,
        md: 992,
        lg: 1200,
    };
    var tag;

    //重新计算当前窗口规格
    function setXmedia() {
        var wid = window.innerWidth;
        tag = 'xs';
        if (wid >= set.sm) tag = 'sm';
        if (wid >= set.md) tag = 'md';
        if (wid >= set.lg) tag = 'lg';
        Vue.prototype.$xmedia = tag;
    };

    //初始化计算
    setXmedia();
    Vue.prototype.$xmedia = {
        value: tag,
        gt: function (str) {
            return set[str] ? set[tag] >= set[str] : false;
        },
        st: function (str) {
            return set[str] ? set[tag] <= set[str] : false;
        },
    };

    //窗口变化时候刷新
    window.addEventListener('resize', function () {
        setXmedia();
    });

    //检测str是否符合tag的规格，str可以是空格隔开的多个
    function checkMedia(str, el, dis) {
        if (str.indexOf(tag) != -1) {
            el.style.display = dis;
            return true;
        } else {
            el.style.display = 'none';
            return true;
        };
    };

    //生成指令，自动监听同步窗口变化
    Vue.directive('xmedia', {
        bind: function (el, binding, vnode, oldVnode) {
            var dis = el.style.display || 'block';
            var str = binding.expression;
            checkMedia(str, el, dis);
            window.addEventListener('resize', function () {
                checkMedia(str, el, dis);
            });
        }
    });
};
