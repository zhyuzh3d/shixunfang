/**
 * 将普通callback函数转为promise的方法，务必注意异常捕获，这里不包含reject处理，参见底部samples
 * 第一个参数是执行的函数和上下文，function则忽略上下文，[ctx,'fnName']则分离函数和上下文
 * gen方法，fn(arg,...,callBackFn(err,res))格式的函数可用；
 * gen2方法，fn(callBackFn(err,res)，arg,...)格式的函数可用；
 * 可实现sleep类似方法，await _zprms.gen2(setTimeout, 5000);
 */
'use strict';

const _zprms = {
    gen: gen,
    gen2: gen2,
};

module.exports = _zprms;

//-----------------------functions------------------------

/**
 * 匹配参数格式fn(arg,...,callBackFn(err,res))的函数
 * @returns {promise} promise
 */
function gen() {
    var prms = genPromise(arguments, true);
    return prms;
};

/**
 * 匹配参数格式fn(callBackFn(err,res),arg,...)的函数
 * @returns {promise} promise
 */
function gen2() {
    var prms = genPromise(arguments, false);
    return prms;
};

/**
 * 将callback转换为promise的关键函数
 * @param   {object} args   原始函数的参数，即arguments对象,第一个参数必须是需要运行的函数function或者数组[ctx,'fnName'],参考底部的sample
 * @param   {boolean} cbAtEnd  callback函数是否最后一个参数，默认为true
 * @returns {promise} promise
 */
function genPromise(args, cbAtEnd = true) {
    return new Promise((resolve, reject) => {
        function callbackFn(err, res) {
            var cbArgs = arguments;

            var datas = [];
            for (var i = 0; i < cbArgs.length; i++) {
                var arg = cbArgs[i];
                if (arg) {
                    if (arg.cosntructor == Error) {
                        //参数里如果有一个Error就reject抛出这个错误
                        reject(arg);
                    } else {
                        datas.push(arg);
                    };
                };
            };

            if (datas.length < 1) {
                datas = undefined;
            } else if (datas.length = 1) {
                datas = datas[0];
            };

            //正常求解promise
            resolve(datas);
        };

        //从arguments里面第一个参数获取function和ctx上下文
        var fn;
        var ctx;
        var argsArr = [];

        for (var key in args) {
            argsArr.push(args[key]);
        };

        //支持数组[ctx,fnname]格式和无ctx的纯function格式
        if (argsArr[0].constructor == Array) {
            ctx = argsArr[0].length > 0 ? argsArr[0][0] : undefined;
            fn = ctx[argsArr[0][1]];
        } else {
            fn = argsArr[0];
            ctx = fn;
        };

        //去掉第一个作为function的参数
        argsArr.shift();

        //向arguments加入callback函数
        if (cbAtEnd) {
            argsArr.push(callbackFn);
        } else {
            argsArr.unshift(callbackFn);
        };

        fn.apply(ctx, argsArr);
    });
};


//----------------------------------samples------------------------------------
(async function () {
    try {
        //read a file, then print the buffer.
        //var res = await _zprms.gen([$fs, 'readFile'], './base_modules/_zprms2.js');

        //wait 3 sec then print undefined.
        //var res = await _zprms.gen2(setTimeout, 5000);

        //_zloger.log(`_zprms:samples run:${res}`);
    } catch (err) {
        //_zloger.log(`_zprms:samples err':${err},${res}`);
    };
})();
