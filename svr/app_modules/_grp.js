/*group组合班级相关功能
 */
var _grp = {};

module.exports = _grp;

/**
 * 获取我的全部班级列表，可选是member，manager，teacher，assistant都包含
 * 返回数组
 */
_zrouter.addApi('/grpGetMyGroupArr', {
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
 * 获取某个班级的详细信息，限定本班成员才能访问;
 * 返回对象,包含此班级的所有方案cases字段
 */
_zrouter.addApi('/grpGetGroupDetail', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId,
    },
    method: async function pageNew(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token);

        var res = await _mngs.models.group.findOne({
                _id: _id,
                $or: [{
                    manager: acc._id
                }, {
                    teachers: acc._id
                }, {
                    assistants: acc._id
                }, {
                    members: acc._id
                }],
            }).populate('school', 'name')
            .populate('manager', 'name avatar')
            .populate('teachers', 'name avatar')
            .populate('assistants', 'name avatar')
            .populate('members', 'name avatar');
        if (!res) throw Error().zbind(_msg.Errs.GrpNotExistOrNotInGrp);

        res = _mngs.fns.clearDoc(res);

        //读取此班级的plan方案列表
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








//
