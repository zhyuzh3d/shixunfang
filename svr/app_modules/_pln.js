/*plan方案相关功能
 */
var _pln = {};
var noDel = _mngs.fns.noDel;

module.exports = _pln;

/**
 * 获取我的所有plan的基本信息;
 * 可用于判断是否已经激活
 */
_zrouter.addApi('/plnGetMyPlanArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
    },
    method: async function plnGetMyPlanArr(ctx) {
        var token = ctx.xdata.token;

        var acc = await _acc.getAccByToken(token);

        var res = await _mngs.models.plan.find(noDel({
            $or: [{
                members: acc._id
            }, {
                manager: acc._id
            }, {
                teachers: acc._id
            }, {
                assistants: acc._id
            }]
        }), 'title').sort({
            created_at: -1
        });

        res = _mngs.fns.clearDoc(res);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 加入一个方案;相当于把自己添加到plan.members
 * 必须位于plan.group.members中的成员才可以执行,管理员、助理或导师不可也不必加入
 * 返回结果
 */
_zrouter.addApi('/plnJoinPlan', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //需要加入的方案
    },
    method: async function plnJoinPlan(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token);

        //检查权限
        var plan = await _mngs.models.plan.findOne({
            _id: _id
        }, 'group').populate('group', 'members');

        if (plan.group.members.indexOf(acc._id) == -1) throw Error().zbind(_msg.Errs.GrpNeedMemberPower);

        //添加到members
        var res = await _mngs.models.plan.updateOne({
            _id: _id
        }, {
            $push: {
                members: acc._id
            }
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 拉取一个方案的详细信息
 * 必须是plan的成员、管理员、导师或助理
 * 返回结果
 */
_zrouter.addApi('/plnGetDetail', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnGetDetail(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token);

        //检查权限
        var res = await _mngs.models.plan.findOne(noDel({
            _id: _id,
            $or: [{
                members: acc._id
            }, {
                manager: acc._id
            }, {
                teachers: acc._id
            }, {
                assistants: acc._id
            }]
        }));

        res = _mngs.fns.clearDoc(res);
        if (!res) throw Error().zbind(_msg.Errs.PlnNoPowerOrNonExist);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});



/**
 * 创建一个新的方案，必须有班级id
 * 必须是班级的manager
 * 返回结果
 */
_zrouter.addApi('/plnCreatePlan', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        title: _conf.regx.title, //plan.title
        gid: _conf.regx.mngId, //plan.group._id
    },
    method: async function plnCreatePlan(ctx) {
        var token = ctx.xdata.token;
        var gid = ctx.xdata.gid;
        var title = ctx.xdata.title;

        var acc = await _acc.getAccByToken(token);

        //检查权限
        var group = await _mngs.models.group.findOne({
            _id: gid
        }, 'manager');
        if (!group || String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //创建
        var res = await new _mngs.models.plan({
            title: title,
            group: gid,
        }).save();

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 删除一个方案，只是标记del
 * 必须是班级的manager
 * 返回结果
 */
_zrouter.addApi('/plnRemovePlan', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnCreatePlan(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token);

        var plan = await _mngs.models.plan.findOne({
            _id: _id
        }, 'group');
        if (!plan) throw Error().zbind(_msg.Errs.PlnNonExist);

        //检查权限
        var group = await _mngs.models.group.findOne({
            _id: plan.group
        }, 'manager');
        if (!group || String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //删除
        var res = await plan.update({
            __del: true
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});









//
