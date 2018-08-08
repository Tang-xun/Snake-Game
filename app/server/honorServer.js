const rx = require('rx');
const honor = require('../db/snakeHonor');

const logger = require('../logger').logger('honors', 'info');

let honorRule = [];



function initHonorServer() {
    let i = 0;
    honor.listHonors().subscribe(
        it => {
            // console.log(it);
            honorRule = it;
        }
    );
}

function findHonor(mode, type, v) {
    rx.Observable.from(honorRule)
        .filter(it => it.gameType == 2 || it.gameType == mode)
        .filter(it => it.gainType === type)
        .filter(it => it.v < v).last().subscribe(console.log);
}

initHonorServer();
setTimeout(function () {
    findHonor(0, 1, 101);
}, 50);
