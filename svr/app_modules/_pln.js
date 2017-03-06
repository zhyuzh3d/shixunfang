/*plan方案相关功能
 */
var _pln = {};

module.exports = _pln;

/**
 * 获取我的所有plan的基本信息;
 * 可用于判断是否已经激活
 */
_zrouter.addApi('/plnGetMyPlanArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
    },
    method: async function pageNew(ctx) {
        var token = ctx.xdata.token;

        var acc = await _acc.getAccByToken(token);

        var res = await _mngs.models.plan.find({
            member: acc._id
        }, 'title').sort({
            created_at: -1
        });

        res = _mngs.fns.clearDoc(res);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 激活一个plan，将自己加入到plan.members;
 * 必须是plan.group的成员才能加入
 */
_zrouter.addApi('/plnActivePlan', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //plan的id
    },
    method: async function pageNew(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token);

        var plan = await _mngs.models.plan.findOne({
            _id: _id
        }, 'title group').populate('group', 'name members');

        if (plan.group.members.indexOf(acc._id) == -1) {
            throw Error().zbind(_msg.Errs.GrpNotInGrp, ',班级名:' + plan.group.name);
        };

        var res = await plan.group.update({
            $push: {
                members: acc._id
            }
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});



//
