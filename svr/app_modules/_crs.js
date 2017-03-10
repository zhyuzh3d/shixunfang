/* course课程相关功能
 */
var _crs = {};
var noDel = _mngs.fns.noDel;

module.exports = _crs;

/**
 * 获取某个技术方向的全部课程列表
 * 无权限限制
 * 返回结果
 */
_zrouter.addApi('/crsGetAllCourse', {
    validator: {
        category: /[\s\S]{3,16}/,
    },
    method: async function crsGetAllCourse(ctx) {
        var category = ctx.xdata.category;
        var res = await _mngs.models.course.find(noDel({
            category: category
        }), 'title');
        ctx.body = new _msg.Msg(null, ctx, res);
    },
});





//
