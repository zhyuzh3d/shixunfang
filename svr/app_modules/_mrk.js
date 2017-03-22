/* mark审阅相关功能
 */
var _mrk = {};
var noDel = _mngs.fns.noDel;

module.exports = _mrk;

/**
 * 老师审核通过一个check提交
 * 必须是mark的作者
 * 返回数组
 */
_zrouter.addApi('/mrkSetPass', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //mark.id
        comment: function (ipt, ctx) {
            return ipt === undefined || /^[\S\s]{0,256}$/.test(ipt);
        },
    },
    method: async function mrkSetPass(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        //提取mark
        var mark = await _mngs.models.mark.findOne(noDel({
            _id: ctx.xdata._id,
        }), 'check author');
        if (!mark) throw Error().zbind(_msg.Errs.MrkNotFound);
        if (String(mark.author) != String(acc._id)) throw Error().zbind(_msg.Errs.MrkNoPower);

        //设置mark
        var markRes = await _mngs.models.mark.update(noDel({
            _id: mark._id,
        }), {
            pass: true,
            state: 'marked',
            comment: ctx.xdata.comment,
        });

        //设置check
        var checkRes = await _mngs.models.check.update(noDel({
            _id: mark.check,
        }), {
            pass: true,
            state: 'marked',
            lastMark: mark._id,
            checkAt: new Date(),
        });

        var res = {
            markRes: markRes,
            checkRes: checkRes,
        };

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});


/**
 * 老师驳回一个mark的check提交
 * 必须是mark的作者
 * 返回数组
 */
_zrouter.addApi('/mrkSetReject', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        _id: _conf.regx.mngId, //mark.id
        comment: function (ipt, ctx) {
            return ipt === undefined || /^[\S\s]{0,256}$/.test(ipt);
        },
    },
    method: async function mrkSetReject(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        //提取mark
        var mark = await _mngs.models.mark.find(noDel({
            _id: ctx.xdata._id,
        }), 'check author');

        if (!mark) throw Error().zbind(_msg.Errs.MrkNotFound);
        if (mark.author != acc._id) throw Error().zbind(_msg.Errs.MrkNoPower);

        //设置mark
        var markRes = await _mngs.models.mark.findOneAndUpdate(noDel({
            _id: mark._id,
        }), {
            pass: false,
            state: 'marked',
            comment: ctx.xdata.comment,
        });

        //设置check
        var checkRes = await _mngs.models.mark.findOneAndUpdate(noDel({
            _id: mark.check,
        }), {
            pass: false,
            state: 'marked',
            lastMark: mark._id,
            checkAt: new Date(),
        });

        var res = {
            markRes: markRes,
            checkRes: checkRes,
        };
        ctx.body = new _msg.Msg(null, ctx, res);
    },
});



/**
 * 老师获取自己最近没有处理的10个mark
 * 返回数组
 */
_zrouter.addApi('/mrkGetMyMarkArr', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
    },
    method: async function mrkGetMyMarkArr(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);
        var markArr = await _mngs.models.mark.find(noDel({
            author: acc._id,
            state: {
                $ne: 'marked'
            },
        })).populate({
            path: 'check',
            populate: [{
                path: 'author',
                select: 'name avatar',
            }, {
                path: 'task',
            }, {
                path: 'plan',
                select: 'title'
            }],
        }).sort({
            created_at: -1
        }).limit(10);

        ctx.body = new _msg.Msg(null, ctx, markArr);
    },
});









//
