/*admin后台管理功能
 */
var _adm = {};

//导出模块
module.exports = _adm;

/**
 * 查询芒果数据库
 */
_zrouter.addApi('/admRunMngsCmd', {
    validator: {
        token: _conf.regx.token,
        cmd: function (ipt, ctx) {
            return true;
        },
    },
    method: async function admRunMngsCmd(ctx) {
        var token = ctx.xdata.token;

        //验证身份，mobile必须是13405045537
        var res = await _mngs.models.user.findOne({
            _token: token,
        }, 'mobile');
        if (!res) throw Error().zbind(_msg.Errs.AccTokenNotMatch);
        if (res.mobile != '13405045537') throw Error().zbind(_msg.Errs.AdmHaveNoPower);

        //运行cmd命令
        var model = _mngs.models[ctx.xdata.model];
        var res = await eval(`_mngs.${ctx.xdata.cmd}`);

        ctx.body = new _msg.Msg(null, ctx, res);
    },
});
