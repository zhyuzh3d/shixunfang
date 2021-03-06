/*group组合班级相关功能
 */
var _grp = {};
var noDel = _mngs.fns.noDel;

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

        var res = await _mngs.models.group.find(noDel({
            $or: [{
                manager: acc._id
            }, {
                teachers: acc._id
            }, {
                assistants: acc._id
            }, {
                members: acc._id
            }]
        })).populate('school', 'name').sort({
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

        var res = await _mngs.models.group.findOne(noDel({
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
            })).populate('school', 'name')
            .populate('manager', 'name avatar')
            .populate('teachers', 'name avatar')
            .populate('assistants', 'name avatar')
            .populate('members', 'name avatar mobile')
            .populate('vmembers', 'name mobile');
        if (!res) throw Error().zbind(_msg.Errs.GrpNotExistOrNotInGrp);

        res = _mngs.fns.clearDoc(res);

        //读取此班级的plan方案列表
        var plans = await _mngs.models.plan.find(noDel({
                group: _id
            })).populate('group', 'name')
            .sort({
                created_at: -1
            });

        res.plans = _mngs.fns.clearDoc(plans);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 获取某个班级的虚拟成员信息，用于对比检查虚拟成员情况;
 * 必须是班级管理员或导师、助理
 * 返回数组
 */
_zrouter.addApi('/grpGetVmembers', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //group._id
    },
    method: async function grpGetVmembers(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var res = await _mngs.models.group.findOne(noDel({
            _id: ctx.xdata._id,
            $or: [{
                manager: acc._id
                }, {
                teachers: acc._id
                }, {
                assistants: acc._id
                }],
        }), 'vmembers').populate('vmembers', 'name mobile');
        if (!res) throw Error().zbind(_msg.Errs.GrpNotExistOrNotInGrp);

        ctx.body = new _msg.Msg(null, ctx, res.vmembers);
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
        if (!group || String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

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
        var res = await _mngs.models.group.updateOne({
            _id: _id
        }, {
            $set: {
                vmembers: vidArr,
            }
        });

        ctx.body = new _msg.Msg(null, ctx, vmArrRes);
    },
});

/**
 * 移除一个班级虚拟成员和对应的成员（虚拟成员彻底删除），必须管理员权限
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

        if (!group || String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //从数组中删除
        var res = await _mngs.models.group.updateOne({
            _id: _id
        }, {
            $pull: {
                vmembers: vid,
                members: rid
            }
        });

        //删除虚拟成员
        await _mngs.models.vuser.remove({
            _id: vid
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 寻找等待我加入的班级
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
        var groupArr = await _mngs.models.group.find(noDel({
            vmembers: {
                $in: vusrIdArr
            },
            members: {
                $ne: acc._id,
            },
        }), 'name');

        ctx.body = new _msg.Msg(null, ctx, groupArr);
    },
});


/**
 * 加入一个班级
 * 班级的虚拟成员中至少有一个mobile与用户相同
 * 返回数组
 */
_zrouter.addApi('/grpJoinGroup', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //group._id
    },
    method: async function grpJoinGroup(ctx) {
        var token = ctx.xdata.token;
        var _id = ctx.xdata._id;

        var acc = await _acc.getAccByToken(token, 'mobile');

        //权限检查，提取班级内对应的虚拟帐号，如果有。manager或teacher，assistant都不能加入。
        var vusrArr = await _mngs.models.group.find({
            _id: _id,
        }, 'vmembers').populate({
            path: 'vmembers',
            match: {
                mobile: acc.mobile,
            },
            select: '_id',
            options: {
                limit: 1
            }
        });

        if (vusrArr.length == 0) throw Error().zbind(_msg.Errs.GrpNeedVMemberPower);

        //添加到members
        var res = await _mngs.models.group.updateOne({
            _id: _id,
        }, {
            $addToSet: {
                members: acc._id,
            }
        });

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 删除导师或助理
 * 必须管理员权限
 * 返回结果
 */
_zrouter.addApi('/grpRemoveUser', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        type: /(teacher)|(assistant)/,
        gid: _conf.regx.mngId, //group._id
        uid: _conf.regx.mngId, //user._id
    },
    method: async function grpRemoveUser(ctx) {
        var token = ctx.xdata.token;
        var type = ctx.xdata.type;
        var gid = ctx.xdata.gid;
        var uid = ctx.xdata.uid;

        var acc = await _acc.getAccByToken(token);

        //权限判断
        var group = await _mngs.models.group.findOne({
            _id: gid
        }, 'manager');
        if (!group || String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //执行
        var op = {};
        op.$pull = type == 'teacher' ? {
            teachers: uid,
        } : {
            assistants: uid
        };

        var res = await _mngs.models.group.updateOne({
            _id: gid
        }, op);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});

/**
 * 通过电话号码添加导师或助理
 * 必须管理员权限
 * 返回结果
 */
_zrouter.addApi('/grpAddUser', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        type: /(teacher)|(assistant)/,
        gid: _conf.regx.mngId, //group._id
        mobile: _conf.regx.mobile, //user.mobile
    },
    method: async function grpAddUser(ctx) {
        var token = ctx.xdata.token;
        var type = ctx.xdata.type;
        var gid = ctx.xdata.gid;
        var mobile = ctx.xdata.mobile;

        var acc = await _acc.getAccByToken(token);

        //权限判断
        var group = await _mngs.models.group.findOne({
            _id: gid
        }, 'manager');
        if (!group || String(group.manager) != acc._id) throw Error().zbind(_msg.Errs.GrpNeedManagerPower);

        //获取mobile对应的用户
        var usr = await _mngs.models.user.findOne({
            mobile: mobile
        }, '_id');
        if (!usr) throw Error().zbind(_msg.Errs.AccNotExist);

        //执行
        var op = {};
        op.$push = type == 'teacher' ? {
            teachers: usr._id,
        } : {
            assistants: usr._id,
        };

        var res = await _mngs.models.group.updateOne({
            _id: gid
        }, op);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});









//
