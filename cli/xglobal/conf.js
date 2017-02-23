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
};
