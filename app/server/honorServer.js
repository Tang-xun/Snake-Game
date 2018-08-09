const rx = require('rx');
const honor = require('../db/snakeHonor');

const logger = require('../logger').logger('honors', 'info');

/* honor.listHonors().flatMap(it => {
    honorRule = it;
    return rx.Observable.from(it);
}).groupBy(it => it.gameType && it.gainType)
    .subscribe(group => group.toArray().subscribe(it => {
        it[0]
        it.forEach((v, i) => {
            console.log(`${JSON.stringify(v)}`);
        });
    })); */
honor.listHonors().subscribe(it => console.log(it.filter(function (element) {
    return element.gameType == 0, element.gainType == 1;
})));


let honorRule = [];

let honorGroup = { win: [0, 1], kill: [2, 2], linkKill: [2, 3], lenght: [1, 4], time: [1, 5], skinNum: [2, 8] };
let valueScope = { win: [], kill: [], linkKill: [], lenght: [], time: [], skinNum: [] };



function findWinCountHonor(v) {
    return findHonor(honorGroup.win[0], honorGroup.win[1], v);
}

function findKillCount(v) {
    return findHonor(honorGroup.kill[0], honorGroup.kill[1], v);
}

function findLinkKillHonor(v) {
    return findHonor(honorGroup.linkKill[0], honorGroup.linkKill[1], v);
}

function findLiveTimeHonor(v) {
    return findHonor(honorGroup.time[0], honorGroup.time[1], v);
}

function findLengthHonor(v) {
    return findHonor(honorGroup.lenght[0], honorGroup.lenght[1], v);
}

function findSkinNumHonor(v) {
    return findHonor(honorGroup.skinNum[0], honorGroup.skinNum[1], v);
}

function findHonor(mode, type, v) {
    logger.info(`findHonor ${mode}, ${type} ,${v}`);
    return rx.Observable.from(honorRule)
        .filter(it =>
            (it.gameType == 2 || it.gameType == mode) &&
            it.gainType === type && it.v < v).last();
}

// setTimeout(() => {
//     findWinCountHonor(101).subscribe(console.log);
//     findKillCount(101).subscribe(console.log);
//     findLinkKillHonor(35).subscribe(console.log);
//     findLengthHonor(30000).subscribe(console.log);
//     findLiveTimeHonor(30000).subscribe(console.log);
//     findSkinNumHonor(20).subscribe(console.log);
// }, 500);