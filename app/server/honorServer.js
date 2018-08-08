const rx = require('rx');
const honor = require('../db/snakeHonor');

const logger = require('../logger').logger('honors', 'info');

honor.listHonors().subscribe(it => honorRule = it);
let honorRule = [];

function findHonor(mode, type, v) {
    logger.info(`findHonor ${mode}, ${type} ,${v}`);
    return rx.Observable.from(honorRule)
        .filter(it => it.gameType == 2 || it.gameType == mode)
        .filter(it => it.gainType === type)
        .filter(it => it.v < v).last();
}

setTimeout(() => {
    findHonor(0, 1, 101).subscribe(console.log);
}, 500);
