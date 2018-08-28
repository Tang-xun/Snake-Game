const rx = require('rx');

const logger = require('../logger').logger('ranks', 'info');
const user = require('../db/snakeUser');

let minutesUint = 60000

let shortDelay = 2000;
let shortUpdateDuration = process.env == 'dev' ? minutesUint * 5 : minutesUint * 30;

let longDelay = shortDelay * 2;
let longUpdateDuration = shortUpdateDuration * 2;

let rankExp = [];
function sysConfig() {
    this.userCount = 0;
    this.payCount = 0;
}

let ServerConfig = new sysConfig();

/**
 * fetch user count timeTask
 */
function rxFetchUserCount() {
    logger.info(`shortDelay: ${shortDelay} shortUpdateDuration:${shortUpdateDuration}`);
    rx.Observable.timer(shortDelay, shortUpdateDuration).flatMap(() => {
        logger.info(`[time task] rxFetchUserCount :::`);
        return user.getUserCount();
    }).subscribe(data => {
        logger.info(`[time task] fetch user count next ${JSON.stringify(data)}`);
        global.userCount = data;
        ServerConfig.userCount = data;
    }, error => {
        logger.error(`[time task] fetch user count error ${error}`);
    })
}

/**
 *  rank user score timeTask
 */
function rxRanksTimeTask() {
    rx.Observable.timer(longDelay, longUpdateDuration).flatMap(() => {
        logger.info('[time task] rxRanksTimeTask ::: ');
        return user.sortUserExp();
    }).subscribe(next => {
        logger.info(`[time task] next update userRanks message: ${next.message}`);
    }, error => {
        logger.info(`[time task] error sort user score ${error}`);
    });
}

function rxFetchRankScore() {
    rx.Observable.timer(shortDelay + 1000, shortUpdateDuration).flatMap(() => {
        logger.info('[time task] rxFetchRankScore :::');
        if (isNaN(global.userCount)) {
            logger.info(`user count is NaN needn't fetch Rank ${ServerConfig.userCount} ${global.userCount}`);
            throw { error: 'user count is NaN' };
        }
        let groupCount = Math.round(global.userCount / 20);
        logger.info(`[time task] current user score group count ${groupCount}`);
        return user.fetchRankExp(groupCount > 0 ? groupCount : 1);
    }).subscribe(next => {
        logger.info(`[time task] rxFetchRankScore next ${JSON.stringify(next)}`);
        rankExp = next;
    }, error => {
        logger.info(`[time task] error fetch rank score ${error}`);
    })
}

function calUserRanks(curExp) {
    logger.info(`calUserRanks start ${curExp}`);
    return rx.Observable.from(rankExp)
        .first(it => it.curExp <= curExp)
        .map(it => Math.floor(it.ranks / (rankExp.length) * 100))
        .catch(error => {
            if (error.name = 'EmptyError') {
                if (global.userCount == 0) {
                    return rx.Observable.just(100);
                } else {
                    return rx.Observable.just(Math.round(100 / global.userCount));
                }
            }
        });
}

function calUserRanksSync(curExp) {
    logger.info('calUser Ranks start ' + curExp);

    let rankBeans = rankExp.filter(it => it.curExp >= curExp);

    if (rankBeans.length == 0) return 5;
    if (rankBeans.length == curExp.length) return 100;

    return Math.floor((rankBeans.length / global.userCount) * 100);
}

module.exports = {
    ServerConfig,
    calUserRanks,
    calUserRanksSync,
    rxFetchUserCount,
    rxFetchRankScore,
    rxRanksTimeTask,
}