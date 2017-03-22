/**
 * mongoose数据库基本功能
 * 删除统一使用__del=true
 */

var _mngs = {};


_mngs.startPrms = function () {
    var prms = new Promise(function (resolvefn, rejectfn) {
        $mongoose.connect('mongodb://localhost/shixunfang');
        _mngs.db = $mongoose.connection;
        _mngs.db.on('error', function (err) {
            _zloger.err('_mngs:startPrms:db error', err);
            rejectfn(err);
        });
        _mngs.db.once('open', function () {
            _zloger.info('_mngs:startPrms:Mongoose is ready on shixunfang.');
            resolvefn(_mngs);
        });
    });
    return prms;
};

//所有数据类型字符串格式，用于his.targetType
_mngs.types = {
    user: 'user',
    file: 'file',
    page: 'page',
    his: 'his',
    school: 'school',
    group: 'group',
    task: 'task',
};





//-------------------functions-----------------------------


var fns = _mngs.fns = {
    clearDoc,
    noDel,
};

/**
 * 补充数据__del查询字段
 */
function noDel(obj) {
    var res = {};
    for (var attr in obj) {
        res[attr] = obj[attr];
    };

    res.__del = {
        $ne: true
    };

    return res;
};


/**
 * 将所有下划线开头的属性都删除，但保留_id
 * 必须具有_id字段才会被清理
 * @param   {object} obj    obj
 * @returns {object} obj
 */
function clearDoc(doc) {
    //如果undefined,null,0,false，直接返回
    if (!doc) return doc;

    //如果是队列，那么逐个执行
    if (doc.constructor == Array) {
        var arr = [];
        doc.forEach(function (item) {
            arr.push(clearDoc(item));
        });
        return arr;
    };

    //如果有_id属性(必然是对象)，那么先转object，再针对每个属性执行
    if (doc['_id']) {
        var obj = doc.toObject ? doc.toObject() : Object(doc);
        for (var attr in obj) {
            if (attr != '_id' && attr[0] == '_') {
                delete obj[attr];
            } else {
                obj[attr] = clearDoc(obj[attr]);
            };
        };

        doc = obj;
    };

    return doc;
};


//----------------schemas&&models-------------------------
var schemas = _mngs.schemas = {}; //全部图式
var models = _mngs.models = {}; //全部模型


//用户数据
schemas.user = new $mongoose.Schema({
    name: String,
    mobile: String,
    avatar: {
        type: String,
        default: 'http://app.10knet.com/HJ4LSF5Ye/defaultIcon128.png', //必须app.10knet.com以便于裁剪
    },
    sex: {
        type: String,
        default: 'unknown',
    },
    _pw: String,
    exp: {
        type: Number,
        default: 0
    },
    coin: {
        type: Number,
        default: 10
    },
    qq: String,
    wechat: String,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.user = $mongoose.model('user', schemas.user);

//自动生成的虚拟用户，用于匹配班级内的真实姓名，注册前通过mobile匹配，注册后通过id匹配
schemas.vuser = new $mongoose.Schema({
    name: String,
    mobile: String,
    uid: $mongoose.Schema.Types.ObjectId,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.vuser = $mongoose.model('vuser', schemas.vuser);


//学校数据
schemas.school = new $mongoose.Schema({
    name: String,
    desc: String,
    link: String,
    city: String,
    province: String,
    parent: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'school',
    },
    _note: String,
    avatar: String,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.school = $mongoose.model('school', schemas.school);

//班级数据
schemas.group = new $mongoose.Schema({
    name: String,
    desc: String,
    department: String, //系
    major: String, //科，专业
    begin: Date, //入学年份
    end: Date, //毕业年份
    manager: { //管理员，客服，发布课程
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    teachers: [{ //班主任，维护班级成员
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    assistants: [{ //助理，可协助维护班级成员
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    school: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'school',
    },
    members: [{ //成员
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    vmembers: [{ //虚拟成员，包含手机信息,普通成员无权拉取
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'vuser',
    }],
    avatar: String,
    _note: String,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.group = $mongoose.model('group', schemas.group);

//任务对象
schemas.task = new $mongoose.Schema({
    category: String,
    title: String,
    desc: String,
    type: String,
    link: String,
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    tags: [String],
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.task = $mongoose.model('task', schemas.task);


//任务打包对象，如每日课程，每周课程
schemas.pack = new $mongoose.Schema({
    category: String,
    title: String,
    desc: String,
    days: {
        type: Number,
        default: 1,
    },
    tasks: [{
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'task',
    }],
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    tags: [String],
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.pack = $mongoose.model('pack', schemas.pack);

//课程对象
schemas.course = new $mongoose.Schema({
    category: String,
    title: String,
    desc: String,
    packs: [{
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'pack',
    }],
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    tags: [String],
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.course = $mongoose.model('course', schemas.course);

//实施方案
schemas.plan = new $mongoose.Schema({
    title: String,
    desc: String,
    group: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'group',
    },
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    course: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'course',
    },
    manager: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    teachers: [{
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    assistants: [{
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    members: [{
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    begin: Date,
    end: Date,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.plan = $mongoose.model('plan', schemas.plan);

//任务检查对象,记录用户某个task的完成情况;plan用于快速查询完成度
schemas.check = new $mongoose.Schema({
    plan: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'plan',
    },
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    task: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'task',
    },
    state: String, //undefined,checked,marking,marked...
    pass: Boolean,
    passAt: Date,
    urls: [String], //用户提交的作品地址或github地址
    files: [String], //用户提交的文件地址
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.check = $mongoose.model('check', schemas.check);

//评审打分对象,老师对学生提交的check进行打分,同一学生同一个task在被marked之后可以再发起新mark
schemas.mark = new $mongoose.Schema({
    check: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'check',
    },
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user', //系统根据check的case指定到对应的技术老师
    },
    comment: String,
    state: String, //marking,marked...同一个任务，只要处理一个就将其他没marked的都删除
    pass: Boolean,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.mark = $mongoose.model('mark', schemas.mark);



//文件对象
schemas.file = new $mongoose.Schema({
    uploader: { //上传者id
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    page: { //上传者id
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'page',
    },
    filename: String,
    filesize: Number,
    hash: String,
    tag: String,
    url: String,
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.file = $mongoose.model('file', schemas.file);

//页面对象，每个页面对应一个当前文件file(html)以及多个历史file版本his
schemas.page = new $mongoose.Schema({
    name: String, //页面名，每用户不可重复
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    file: { //当前文件
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'file',
    },
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at',
    },
});
models.page = $mongoose.model('page', schemas.page);

//历史记录数据，一般不用来查询，数量会很庞大
schemas.his = new $mongoose.Schema({
    tag: String, //类型
    author: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    //target: Array,//操作目标对象_id，数组
    //targetType: String,//操作目标对象类型
    //params:Array,//操作参数，数组
}, {
    strict: false,
    timestamps: {
        createdAt: 'created_at',
    },
});
models.his = $mongoose.model('his', schemas.his);







//导出模块
module.exports = _mngs;
