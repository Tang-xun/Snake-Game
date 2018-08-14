const rx = require('rx');
const honor = require('../db/snakeHonor');
const logger = require('../logger').logger('honors-manager', 'info');

let honorRule = {};
let honorGroup = {};
let honorScope = {};

let honorKeys = { win: 10, kill: 22, linkKill: 32, length: 41, time: 51, skinNum: 82, wordRank: 62, friendRank: 72 }

honor.listHonors().flatMap(it => {
    return rx.Observable.from(it);
}).subscribe(it => {
    key = it.gainType * 10 + it.gameType;
    if (!honorRule[key]) {
        honorRule[key] = [];
    }
    honorRule[key].push(it);

    if (!honorGroup[key]) {
        honorGroup[key] = [];
        honorGroup[key] = [it.gainType, it.gameType];
    }
    if (!honorScope[key]) {
        honorScope[key] = [];
    }
    honorScope[key].push(it.v);
}, error => logger.info(error));

function fetchHonorSync(bean) {

    let winCount = bean.winCount;
    let length = bean.length;
    let bestKill = bean.bestKill;
    let linkKill = bean.linkKill;
    let liveTime = bean.liveTime;
    let skinNum = bean.skinNum;

    logger.info(`${winCount} ${length} ${bestKill} ${linkKill} ${liveTime}`);
    let res = {};
    let a = honorScope[honorKeys.win].filter(it => it <= winCount).length - 1;
    let b = honorScope[honorKeys.length].filter(it => it <= length).length - 1;
    let c = honorScope[honorKeys.kill].filter(it => it <= bestKill).length - 1;
    let d = honorScope[honorKeys.linkKill].filter(it => it <= linkKill).length - 1;
    let e = honorScope[honorKeys.time].filter(it => it <= liveTime).length - 1;
    let f = honorScope[honorKeys.skinNum].filter(it => it <= skinNum).length - 1;

    res = {
        winHonor: (a > -1 ? honorKeys.win * 10 + a : honorKeys.win),
        killHonor: (c > -1 ? honorKeys.kill * 10 + c : honorKeys.kill),
        timeHonor: (e > -1 ? honorKeys.time * 10 + e : honorKeys.time),
        skinHonor: (f > -1 ? honorKeys.skinNum * 10 + f : honorKeys.skinNum),
        lengthHonor: (b > -1 ? honorKeys.length * 10 + b : honorKeys.length),
        linkKillHonor: (d > -1 ? honorKeys.linkKill * 10 + d : honorKeys.linkKill),
    }
    
    logger.info(res)

    return res;
}

function fetchHonorRx(winCount, length, kill, linkKill, time, skinNum) {
    logger.info(`${winCount} ${length} ${kill} ${linkKill} ${time}`);

    return rx.Observable.create(observer => {
        observer.onNext([
            honorScope[honorKeys.win].filter(it => it <= winCount).length - 1,
            honorScope[honorKeys.length].filter(it => it <= length).length - 1,
            honorScope[honorKeys.kill].filter(it => it <= kill).length - 1,
            honorScope[honorKeys.linkKill].filter(it => it <= linkKill).length - 1,
            honorScope[honorKeys.time].filter(it => it <= time).length - 1,
            honorScope[honorKeys.skinNum].filter(it => it <= skinNum).length - 1
        ]);
    }).map(it => {
        logger.info(it);
        return [
            it[0] > -1 ? honorKeys.win * 10 + it[0] : honorKeys.win,
            it[1] > -1 ? honorKeys.length * 10 + it[1] : honorKeys.length,
            it[2] > -1 ? honorKeys.kill * 10 + it[2] : honorKeys.kill,
            it[3] > -1 ? honorKeys.linkKill * 10 + it[3] : honorKeys.linkKill,
            it[4] > -1 ? honorKeys.time * 10 + it[4] : honorKeys.time,
            it[5] > -1 ? honorKeys.skinNum * 10 + it[5] : honorKeys.skinNum,
        ]
    });
}

function fetchHonorWithCode(code) {
    let key = parseInt(code / 10);
    let index = code - key * 10;

    logger.info(`${key}, ${index}`);
    return honorRule[key][index];
}

module.exports = {
    fetchHonorRx,
    fetchHonorSync,
    fetchHonorWithCode,
}