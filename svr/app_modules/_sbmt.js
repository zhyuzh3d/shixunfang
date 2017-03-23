/* submit提交相关功能
 */
var _sbmt = {};
var noDel = _mngs.fns.noDel;

module.exports = _sbmt;

/**
 * 生成一个提交
 * 不做任何验证，完全交给前端处理
 * 返回生成的submit
 */
_zrouter.addApi('/sbmtCreate', {
    validator: {
        token: _conf.regx.token, //用户token认证信息
        content: _conf.regx.text,
        type: /^[\s\S]{2,12}$/,
        comment: function (ipt, ctx) {
            return ipt === undefined || /^[\S\s]{0,256}$/.test(ipt);
        },
    },
    method: async function createSubmit(ctx) {
        var acc = await _acc.getAccByToken(ctx.xdata.token);

        var submit = {
            author: acc._id,
            content: ctx.xdata.content,
            type: ctx.xdata.type,
            comment: ctx.xdata.comment,
        };

        var res = await _mngs.models.submit(submit).save();

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});





//
