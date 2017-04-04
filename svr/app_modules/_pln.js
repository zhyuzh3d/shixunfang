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
        }), 'title begin end').populate('group', 'name').sort({
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
 * 管理员／老师／助理／成员拉取一个方案的详细信息
 * 必须是plan的管理员、导师或助理
 * 返回结果,完全展开course-packs-tasks，
 * 部分展开group,manager,teacher,assistant(对成员去除member的mobile敏感信息)
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

        var plan = await _mngs.models.plan.findOne(noDel({
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

        //限定只能读取其他用户的姓名和头像，对管理员不进行约束
        var memberSel = 'name avatar';
        if (plan.manager && plan.manager._id == acc._id) memberSel = undefined;

        var plan = await _mngs.models.plan.findOne(noDel({
                _id: _id,
            })).populate('manager')
            .populate('teachers', 'name avatar mobile qq')
            .populate('assistants', 'name avatar mobile qq')
            .populate('members', memberSel)
            .populate('group', 'name')
            .populate({
                path: 'course',
                populate: {
                    path: 'packs',
                    populate: {
                        path: 'tasks'
                    },
                }
            });

        plan = _mngs.fns.clearDoc(plan);
        if (!plan) throw Error().zbind(_msg.Errs.PlnNoPowerOrNonExist);

        ctx.body = new _msg.Msg(null, ctx, plan);
    },
});



/**
 * 创建一个新的方案，必须有班级id
 * 必须是班级的manager，作者也自动被设置为新plan.manager
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
            manager: acc._id,
            author: acc._id,
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
    method: async function plnRemovePlan(ctx) {
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

/**
 * 更新一个方案的标题
 * 必须是plan.manager
 * 返回结果
 */
_zrouter.addApi('/plnUpdateTitle', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        title: _conf.regx.title,
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnUpdateTitle(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata._id,
        });
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        var res = await plan.update({
            title: ctx.xdata.title
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 更新一个方案的描述
 * 必须是plan.manager
 * 返回结果
 */
_zrouter.addApi('/plnUpdateDesc', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        desc: _conf.regx.text,
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnUpdateDesc(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata._id,
        });
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        var res = await plan.update({
            desc: ctx.xdata.desc
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 更新一个方案的开始时间
 * 必须是plan.manager
 * 返回结果
 */
_zrouter.addApi('/plnUpdateBegin', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        begin: /\d{4}-\d{2}-\d{2}/,
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnUpdateBegin(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata._id,
        });
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        var res = await plan.update({
            begin: new Date(ctx.xdata.begin),
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 更新一个方案的开始时间
 * 必须是plan.manager
 * 返回结果
 */
_zrouter.addApi('/plnUpdateGroup', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //plan._id
        gid: _conf.regx.mngId, //group._id
    },
    method: async function plnUpdateGroup(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata._id,
        });
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        var res = await plan.update({
            group: ctx.xdata.gid,
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});






/**
 * 更新一个方案的结束时间
 * 必须是plan.manager
 * 返回结果
 */
_zrouter.addApi('/plnUpdateEnd', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        end: /\d{4}-\d{2}-\d{2}/,
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnUpdateEnd(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata._id,
        });
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        var res = await plan.update({
            end: new Date(ctx.xdata.end),
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 删除导师或助理
 * 必须管理员权限
 * 返回结果
 */
_zrouter.addApi('/plnRemoveUser', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        type: /(teacher)|(assistant)/,
        pid: _conf.regx.mngId, //group._id
        uid: _conf.regx.mngId, //user._id
    },
    method: async function plnRemoveUser(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        //权限判断
        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata.pid
        }, 'manager');
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.PlnNeedManagerPower);

        //执行
        var op = {};
        op.$pull = ctx.xdata.type == 'teacher' ? {
            teachers: ctx.xdata.uid,
        } : {
            assistants: ctx.xdata.uid
        };

        var res = await plan.update(op);
        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 通过电话号码添加导师或助理
 * 必须管理员权限
 * 返回结果
 */
_zrouter.addApi('/plnAddUser', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        type: /(teacher)|(assistant)/,
        pid: _conf.regx.mngId, //group._id
        mobile: _conf.regx.mobile, //user.mobile
    },
    method: async function plnAddUser(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        //权限判断
        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata.pid
        }, 'manager');
        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.PlnNeedManagerPower);

        //获取mobile对应的用户
        var usr = await _mngs.models.user.findOne({
            mobile: ctx.xdata.mobile
        }, '_id');
        if (!usr) throw Error().zbind(_msg.Errs.AccNotExist);

        //执行
        var op = {};
        op.$push = ctx.xdata.type == 'teacher' ? {
            teachers: usr._id,
        } : {
            assistants: usr._id,
        };

        var res = await plan.update(op);
        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 移除一个已经加入的成员，必须管理员权限
 * 未加入成员应在班级内移除
 * 返回数组
 */
_zrouter.addApi('/plnRemoveMemeber', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //班级组的id
        uid: _conf.regx.mngId, //需要移除的人员_id
    },
    method: async function plnRemoveMemeber(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var plan = await _mngs.models.plan.findOne({
            _id: ctx.xdata._id
        }, 'manager');

        if (!plan || String(plan.manager) != acc._id) throw Error().zbind(_msg.Errs.PlnNeedManagerPower);

        //从数组中删除
        var res = await plan.update({
            $pull: {
                members: ctx.xdata.uid
            }
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 获取单个plan的全部task列表
 * 只考虑已经加入的plan的members成员
 * 返回数组
 */
_zrouter.addApi('/plnGetPlanTaskArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //plan._id
    },
    method: async function plnGetPlanTaskArr(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        //拉取所有未结束的plan
        var planArr = await _mngs.models.plan.find({
            members: acc._id,
            _id: ctx.xdata._id,
        }, 'course members').populate({
            path: 'course',
            select: 'packs',
            populate: {
                path: 'packs',
                select: '_id tasks',
                populate: {
                    path: 'tasks',
                }
            }
        });

        ctx.body = new _msg.Msg(null, ctx, packArr);
    },
});



/**
 * 获取多个task对应的check列表
 * 配合plnGetCurTaskArr使用
 * 返回数组
 */
_zrouter.addApi('/plnGetCheckArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        idArr: function (ipt, ctx) {
            var json = JSON.parse(ipt);
            return json && json.constructor == Array;
        }, //[task._id]
    },
    method: async function plnGetCheckArr(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var checkArr = await _mngs.models.check.find({
            task: {
                $in: JSON.parse(ctx.xdata.idArr),
            }
        });

        ctx.body = new _msg.Msg(null, ctx, checkArr);
    },

        //???检检查没有获得check
});




//---------functions-------------






//
