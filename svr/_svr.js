/*后端服务程序入口,初始化babel，支持ES7
 */
'use strict';

//全局异常捕获
process.on('uncaughtException', function (err) {
    console.error("!Global uncaughtException:", err);
});

//ES6/ES7转译
const $babel = global.$babel = require("babel-core/register");
const $polyFill = global.$polyFill = require("babel-polyfill");

//导入全局插件
const $fs = global.$fs = require('fs');
const $http = global.$http = require('http');
const $https = global.$https = require('https');
const $path = global.$path = require('path');
const $gitUrlParse = global.$gitUrlParse = require('git-url-parse');
const $koa = global.$koa = require('koa');
const $koaBody = global.$koaBody = require('koa-bodyparser');
const $_ = global.$_ = require('lodash');
const $moment = global.$moment = require('moment');
const $qiniu = global.$qiniu = require('qiniu');
const $sha256 = global.$sha256 = require('sha256');
const $shortid = global.$shortid = require('shortid');
const $uuid = global.$uuid = require('uuid');
const $redis = global.$redis = require('redis');
const $mongoose = global.$mongoose = require('mongoose');
$mongoose.Promise = global.Promise;

//服务程序真正的入口
console.info(`\n==========${$moment().format('YYYY-MM-DD hh:mm:ss')}==========`);
require("./_app.js");
