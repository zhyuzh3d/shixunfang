/*school院校相关功能
 */
var _schl = {};
var noDel = _mngs.fns.noDel;

module.exports = _schl;

/**
 * 获取全部学院名称列表
 * 任何用户都可读取
 * 返回数组
 */
_zrouter.addApi('/schlGetSchoolArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
    },
    method: async function grpGetMyGroupArr(ctx) {
        var token = ctx.xdata.token;

        var acc = await _acc.getAccByToken(token);

        var res = await _mngs.models.school.find(noDel({}), 'name province city parent avatar').populate('parent', 'name').sort({
            created_at: -1
        });

        res = _mngs.fns.clearDoc(res);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 获取某院校的全部学院名称列表
 * 任何用户都可读取
 * 返回数组
 */
_zrouter.addApi('/schlGetSchoolGroupArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //school._id
    },
    method: async function grpGetMyGroupArr(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var res = await _mngs.models.group.find(noDel({
                school: ctx.xdata._id,
            }), 'name department major begin end')
            .sort({
                created_at: -1
            });

        res = _mngs.fns.clearDoc(res);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});






//
