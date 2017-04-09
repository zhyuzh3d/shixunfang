/* check提交相关功能
 */
var _chck = {};
var noDel = _mngs.fns.noDel;

module.exports = _chck;

var checkMethods = {
    '教程': 'none',
    '资料': 'none',
    '作业': 'teacher',
    '考试': 'ai',
};



/**
 * 用户提交一个task，为其生成一个check并针对班级老师生成一个mark
 * 用户提交之前要自行生成一个submitId，如果是none则可以不生成
 * 自动检测task类型，自动类型直接标记check的pass，不生成mark
 * 返回check(并不一定完整，但是最新)
 */
_zrouter.addApi('/chckSubmit', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //task.id
        planId: _conf.regx.mngId, //plan.id用此获得group.teachers
        submitId: function (ipt, ctx) {
            return ipt === undefined || _conf.regx.mngId.test(ipt);
        },
    },
    method: async function chckSubmit(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        //判断审阅方式
        var task = await _mngs.models.task.findOne({
            _id: ctx.xdata._id
        }, 'type');
        if (!task) throw Error().zbind(_msg.Errs.TskNotFound);

        //判断这个task是否已经提交过了，重复提交直接返回check
        var check = await _mngs.models.check.findOne({
            task: task._id,
        }, 'state pass');
        if (check && check.state != 'reject') {
            ctx.body = new _msg.Msg(null, ctx, check);
            return;
        };

        //生成check
        if (!check) {
            check = await _mngs.models.check({
                task: task._id,
                author: acc._id,
                plan: ctx.xdata.planId,
            }).save();
        };

        var checkMethod = task.type ? checkMethods[task.type] : 'none';
        var res;

        //根据不同的type不同的处理：直接通过
        if (checkMethod == 'none') {
            res = {
                state: 'marked',
                pass: true,
                lastSubmit:ctx.xdata.submitId,
                passAt: new Date(),
            };

            await _mngs.models.check.updateOne({
                _id: check._id
            }, res);
        };

        //根据不同的type不同的处理：老师审阅
        if (checkMethod == 'teacher') {
            //获取plan的teachers列表,随机选择一个老师
            var plan = await _mngs.models.plan.findOne({
                _id: ctx.xdata.planId,
            }, 'teachers');
            if (!plan) throw Error().zbind(_msg.Errs.PlnNonExist);
            if (!plan.teachers) throw Error().zbind(_msg.Errs.ChckNoTeacherFound);

            var teacherId = plan.teachers[Math.floor(Math.random() * plan.teachers.length)];

            //生成mark对象
            res = await _mngs.models.mark({
                check: check._id,
                author: teacherId,
            }).save();

            //更新check.state=marking
            res = {
                lastSubmit:ctx.xdata.submitId,
                state: 'marking',
            };
            await _mngs.models.check.updateOne({
                _id: check._id
            }, res);
        };

        ctx.body = new _msg.Msg(null, ctx, Object.assign(check, res));
    },
});



//








//
