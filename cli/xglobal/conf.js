/*全局设置文件，将被xglobal插件载入到每个component的this.$xglobal.conf备用
 */

var conf = {};
export default conf;

conf.set = {
    userUploadMaxSizeKb: 512, //未注册用户上传限制
    userUploadMaxSizeStr: '512k', //未注册用户上传限制
    accUploadMaxSizeKb: 1024, //注册用户上传限制
    accUploadMaxSizeStr: '1M', //注册用户上传限制
    expAutoSaveMin: 10, //自动保存经验最小限制
    expAutoSaveTime: 60 * 1000, //自动保存经验间隔,每2分钟
    taskTypesObj: {
        '教程': {
            pass: '认真观看教程'
        },
        '资料': {
            pass: '下载资料并认真观看阅读'
        },
        '作业': {
            pass: '按照描述完成作业并上传文件，由老师评审'
        },
        'github': {
            pass: '根据描述编写代码，提交到github，填写项目地址，由老师评审'
        },
        '测试': {
            pass: '80'
        }
    },
    submitTypesObj:{
     'none':'自动过审，不需要提交内容',
     'text':'将一段文字作为提交内容',
     'link':'提交一个地址链接作为内容，可以是第三方页面，如github项目文件地址',
     'image':'上传图片，并提交图片链接地址作为内容',
     'audio':'上传音频，并提交音频链接地址作为内容',
     'video':'上传视频，并提交视频链接地址作为内容',
     'file':'上传任意文件，并提交文件链接地址作为内容',
    },
    taskCategoryArr: ['通用', 'C++', '.net', 'Java', 'Web', 'UI/UE', '其他'],
};

//所有可路由的组件路径
conf.imgs = {
    avatarDefault: 'http://app.10knet.com/HJ4LSF5Ye/defaultIcon128.png',
};


//所有尚未统一的原有页面，原则上元素内不使用任何字符串格式的url地址
conf.urls = {
    host: 'http://10knet.com/',
    githubLogin: 'https://github.com/login/oauth/authorize?client_id=bcc991a3db5d401bd4af&scope=user,repo,delete_repo,public_repo',
};

conf.imgs = {}

//所有接口，原则上元素内不使用任何字符串格式的接口url地址
conf.apis = {
    qnRandKeyUploadToken: `//${location.host}/api/qnRandKeyUploadToken`,

    accGetMobileRegCode: `//${location.host}/api/accGetMobileRegCode`,
    accGetMobileRstCode: `//${location.host}/api/accGetMobileRstCode`,
    accRegByMobile: `//${location.host}/api/accRegByMobile`,
    accSaveProfile: `//${location.host}/api/accSaveProfile`,
    accLogin: `//${location.host}/api/accLogin`,
    accChangePw: `//${location.host}/api/accChangePw`,
    accAutoLogin: `//${location.host}/api/accAutoLogin`,

    admRunMngsCmd: `//${location.host}/api/admRunMngsCmd`,

    pageNew: `//${location.host}/api/pageNew`,
    pageGetList: `//${location.host}/api/pageGetList`,
    pageGetPageByANamePName: `//${location.host}/api/pageGetPageByANamePName`,
    pageDel: `//${location.host}/api/pageDel`,

    coinChangeExp: `//${location.host}/api/coinChangeExp`,

    //for shixunfang
    grpGetMyGroupArr: `//${location.host}/api/grpGetMyGroupArr`,
    grpGetGroupDetail: `//${location.host}/api/grpGetGroupDetail`,
    grpCreateVmembers: `//${location.host}/api/grpCreateVmembers`,
    grpRemoveMemeber: `//${location.host}/api/grpRemoveMemeber`,
    grpFindMyGroup: `//${location.host}/api/grpFindMyGroup`,
    grpJoinGroup: `//${location.host}/api/grpJoinGroup`,
    grpRemoveUser: `//${location.host}/api/grpRemoveUser`,
    grpAddUser: `//${location.host}/api/grpAddUser`,
    grpGetVmembers: `//${location.host}/api/grpGetVmembers`,

    plnGetMyPlanArr: `//${location.host}/api/plnGetMyPlanArr`,
    plnGetDetail: `//${location.host}/api/plnGetDetail`,
    plnJoinPlan: `//${location.host}/api/plnJoinPlan`,
    plnCreatePlan: `//${location.host}/api/plnCreatePlan`,
    plnRemovePlan: `//${location.host}/api/plnRemovePlan`,
    plnUpdateTitle: `//${location.host}/api/plnUpdateTitle`,
    plnUpdateDesc: `//${location.host}/api/plnUpdateDesc`,
    plnUpdateBegin: `//${location.host}/api/plnUpdateBegin`,
    plnUpdateEnd: `//${location.host}/api/plnUpdateEnd`,
    plnUpdateGroup: `//${location.host}/api/plnUpdateGroup`,
    plnRemoveUser: `//${location.host}/api/plnRemoveUser`,
    plnAddUser: `//${location.host}/api/plnAddUser`,
    plnRemoveMemeber: `//${location.host}/api/plnRemoveMemeber`,
    plnGetCheckArr: `//${location.host}/api/plnGetCheckArr`,

    crsGetAllCourse: `//${location.host}/api/crsGetAllCourse`,

    schlGetSchoolArr: `//${location.host}/api/schlGetSchoolArr`,
    schlGetSchoolGroupArr: `//${location.host}/api/schlGetSchoolGroupArr`,

    chckSubmit: `//${location.host}/api/chckSubmit`,

    mrkSetPass: `//${location.host}/api/mrkSetPass`,
    mrkSetReject: `//${location.host}/api/mrkSetReject`,
    mrkGetMyMarkArr: `//${location.host}/api/mrkGetMyMarkArr`,

    sbmtCreate: `//${location.host}/api/sbmtCreate`,



};







//
