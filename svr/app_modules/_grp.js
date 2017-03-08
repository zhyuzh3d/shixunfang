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
    method: async function grpGetMyGroupArr(ctx) {
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
    method: async function grpGetGroupDetail(ctx) {
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
            .populate('members', 'name avatar mobile')
            .populate('vmembers', 'name mobile');
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


/**
 * 创建虚拟成员;需要manager权限
 * 返回完整的虚拟成员数组
 */
_zrouter.addApi('/grpCreateVmembers', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //group的id
        vmembers: function (ipt, ctx) {
            var vms = JSON.safeParse(ipt);
            return vms && vms.constructor == Array;
        },
    },
    method: async function grpCreateVmembers(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;
        var vmembers = JSON.safeParse(ctx.xdata.vmembers);
        var vmarr = [];
        vmembers.forEach(function (item) {
            if (item.mobile && item.name) vmarr.push({
                mobile: item.mobile,
                name: item.name,
            });
        });

        //权限检查
        var acc = await _acc.getAccByToken(token);
        var group = await _mngs.models.group.findOne({
            _id: _id
        }, 'manager vmembers').populate('vmembers', 'mobile name');
        if (String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //添加虚拟成员,mng会自动把id写入vmarr
        var vms = await _mngs.models.vuser.collection.insert(vmarr);

        //组成vmembers id数组
        var vidArr = [];
        var vmobileArr = [];
        var vmArrRes = [];
        vmarr.forEach(function (item) {
            vidArr.push(String(item._id));
            vmobileArr.push(item.mobile);
            vmArrRes.push(item);
        });

        //清除相同mobile的旧虚拟成员
        group.vmembers.forEach(function (item) {
            if (vmobileArr.indexOf(item.mobile) == -1) {
                vidArr.push(String(item._id));
                vmArrRes.push(item);
            };
        });

        //重新设定vmemebrs
        var res = await _mngs.models.group.update({
            _id: _id
        }, {
            $set: {
                vmembers: vidArr,
            }
        });


        var xx = await _mngs.models.group.findOne({
            _id: _id
        }, 'manager vmembers').populate('vmembers', 'mobile name');

        ctx.body = new _msg.Msg(null, ctx, vmArrRes);
    },
});

/**
 * 移除一个班级虚拟成员和对应的成员，必须管理员权限
 * 依赖于前端传递进来的vid和rid
 * 返回数组
 */
_zrouter.addApi('/grpRemoveMemeber', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //班级组的id
        vid: _conf.regx.mngId, //必须要有vmemeberid
        rid: function (ipt, ctx) { //可选memeberid
            return ipt == undefined || _conf.regx.mngId.test(ipt)
        },
    },
    method: async function grpRemoveMemeber(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;
        var vid = ctx.xdata.vid;
        var rid = ctx.xdata.rid;

        var acc = await _acc.getAccByToken(token);

        var group = await _mngs.models.group.findOne({
            _id: _id
        }, 'manager');

        if (String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //从数组中删除
        var res = await _mngs.models.group.updateOne({
            _id: _id
        }, {
            $pull: {
                vmembers: vid,
                members: rid
            }
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 移除一个班级虚拟成员和对应的成员，必须管理员权限
 * 依赖于前端传递进来的vid和rid
 * 返回数组
 */
_zrouter.addApi('/grpFindMyGroup', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
    },
    method: async function grpFindMyGroup(ctx) {
        var token = ctx.xdata.token;

        var acc = await _acc.getAccByToken(token, 'mobile');

        //列出我的手机对应的所有虚拟账号
        var vusrArr = await _mngs.models.vuser.find({
            mobile: acc.mobile
        }, '_id');

        var vusrIdArr = [];
        vusrArr.forEach(function (item) {
            vusrIdArr.push(item._id);
        });

        //根据虚拟帐号对应搜索vmembers
        var groupArr = await _mngs.models.group.find({
            vmembers: {
                $in: vusrIdArr
            },
        }, 'name');

        ctx.body = new _msg.Msg(null, ctx, groupArr);
    },
});









//
