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

    plnGetMyPlanArr: `//${location.host}/api/plnGetMyPlanArr`,
    plnActivePlan: `//${location.host}/api/plnActivePlan`,


};







//
