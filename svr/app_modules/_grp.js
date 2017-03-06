/*group组合班级相关功能
 */
var _grp = {};

module.exports = _grp;

/**
 * 获取我的全部班级列表，可选是member，manager，teacher，assistant都包含
 * 返回数组
 */
_zrouter.addApi('/getMyGroupArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
    },
    method: async function pageNew(ctx) {
        var token = ctx.xdata.token;

        //根据token获取用户id
        var acc = await _acc.getAccByToken(token);


        var res = await _mngs.models.group.find({
            $or: [{
                manager: acc._id
            }, {
                teachers: acc._id
            }, {
                assistants: acc._id
            }, {
                members: acc._id
            }]
        }).populate('school', 'name').sort({
            created_at: -1
        });

        res = _mngs.fns.clearDoc(res);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 获取某个班级的详细信息，任意人可访问;
 * 返回对象,包含此班级的所有方案cases字段
 */
_zrouter.addApi('/getGroupDetail', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId,
    },
    method: async function pageNew(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token);

        var res = await _mngs.models.group.findOne({
                _id: _id
            })
            .populate('school', 'name')
            .populate('manager', 'name avatar')
            .populate('teachers', 'name avatar')
            .populate('assistants', 'name avatar')
            .populate('members', 'name avatar');

        res = _mngs.fns.clearDoc(res);

        //读取此班级的case方案列表
        var plans = await _mngs.models.plan.find({
                group: _id
            })
            .populate('group', 'name')
            .sort({
                created_at: -1
            });

        res.plans = _mngs.fns.clearDoc(plans);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 用户手工加入一个实训方案，将自己添加到plan.members
 * 返回真假
 */
_zrouter.addApi('/joinPlan', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //实训方案的id
    },
    method: async function pageNew(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata.tpl_id;

        var acc = await _acc.getAccByToken(token);

        //读取方案信息
        var caseObj = await _mngs.models.group.findOne({
            _id: _id
        });


        //用户必须在case.group.member中或者是manager，teacher，assitant
        var group = await _mngs.models.group.findOne({
            _id: _id
        });

        if (group.members.indexOf(acc._id) == -1 && group.teachers.indexOf(acc._id) == -1 && group.assistants.indexOf(acc._id) == -1 && group.manager != acc._id) {
            throw Error().zbind(_msg.Errs.GrpNotInGrp);
        };

        //将用户添加到case的members

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});







//
