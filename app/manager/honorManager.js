const rx = require('rx');
const honor = require('../db/snakeHonor');

const logger = require('../logger').logger('honors', 'info');

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
}, error => console.log);


function fetchHonorFromHistroy(winCount, length, kill, linkKill, time, skinNum) {
    console.log(`${winCount} \t ${length} \t ${kill} \t ${linkKill} \t ${time}`);

    rx.Observable.create(observer => {
        observer.onNext([honorScope[honorKeys.win].filter(it => it < winCount).length - 1,
        honorScope[honorKeys.length].filter(it => it < length).length - 1,
        honorScope[honorKeys.kill].filter(it => it < kill).length - 1,
        honorScope[honorKeys.linkKill].filter(it => it < linkKill).length - 1,
        honorScope[honorKeys.time].filter(it => it < time).length - 1,
        honorScope[honorKeys.skinNum].filter(it => it < skinNum).length - 1]);

    }).map(it => [
        it[0] > -1 ? honorKeys.win * 10 + it[0] : honorKeys.win,
        it[1] > -1 ? honorKeys.length * 10 + it[1] : null,
        it[2] > -1 ? honorKeys.kill * 10 + it[2] : null,
        it[3] > -1 ? honorKeys.linkKill * 10 + it[3] : null,
        it[4] > -1 ? honorKeys.time * 10 + it[4] : null,
        it[5] > -1 ? honorKeys.skinNum * 10 + it[5] : null,
    ]).subscribe(console.log);
}

function fetchHonorWithCode(code) {
    let key = code/10;
    let index = code % 100;

    console.log(`${key}, ${index}`);
    return honorRule[key][index];
}

setTimeout(() => {
    fetchHonorFromHistroy(1, 10000000, 40000, 20, 60 * 1000 * 60 * 2, 11);
    fetchHonorWithCode(100);
    fetchHonorWithCode(413);
    fetchHonorWithCode(223);
    fetchHonorWithCode(321);
}, 50);

module.exports = {
    fetchHonorFromHistroy,
}