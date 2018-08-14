const rx = require('rx');
const dao = require('../db/daoBean');
const logger = require('../logger').logger('skiin-manager', 'info');
const skinRecord = require('../db/snakeSkinRecords');

const skinType = [
    { name: '普通皮肤', type: 1 },
    { name: '勇者体验皮肤', type: 2 },
    { name: '勇者皮肤', type: 3 },
    { name: '稀有皮肤体验卡', type: 4 },
    { name: '稀有皮肤', type: 5 },
    { name: '传说皮肤体验卡', type: 6 },
    { name: '传说皮肤', type: 7 }
]

function addSkinRecord(openId, skinName) {
    logger.info(`will add skin record ${openId}\t${skinName}`);
    let skinBean = new dao.SkinRecord();

    let skinInfo = skinType.filter(it => it.name == skinName.name)[0];
    skinBean.name = skinInfo.name;
    skinBean.type = skinInfo.type;
    skinBean.openId = openId;
    skinBean.expired = false;
    let unExpiredTime = new Date().getTime() + dao.noExpiredTime;
    let expiredTime = new Date().getTime() + dao.experienceTime;
    skinBean.expiredTime = skinInfo.type % 2 == 0 ? `${new Date(expiredTime)}` : `${new Date(unExpiredTime)}`;
    skinBean.uri = 'http://xxx/imgs/***.png';
    return skinRecord.addSkinRecord(skinBean);
}

module.exports = {
    addSkinRecord,
}

addSkinRecord('openId', { name: '勇者体验皮肤' });