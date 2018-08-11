const rx = require('rx');

const logger = require('../logger').logger('ranks', 'info');
const user = require('../db/snakeUser');


let shortDelay = 2 * 1000;
let shortUpdateDuration = 5 * 60 * 1000;

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
        logger.info(`rxFetchUserCount ${new Date()}`);
        return user.getUserCount();
    }).subscribe(data => {
        logger.info(`fetch user count next ${JSON.stringify(data)}`);
        global.userCount = data;
        ServerConfig.userCount = data;
    }, error => {
        logger.error(`fetch user count error ${error}`);
    })
}

/**
 *  rank user score timeTask
 */
function rxRanksTimeTask() {
    rx.Observable.timer(longDelay, longUpdateDuration).flatMap(() => {
        logger.info(`rxRanksTimeTask ${new Date()}`);
        return user.sortUserExp();
    }).subscribe(
        next => {
            logger.info(`next update userRanks message: ${next.message}`);
        },
        error => {
            logger.info(`error sort user score ${error}`);
        }
    );
}

function rxFetchRankScore() {
    rx.Observable.timer(shortDelay + 1000, shortUpdateDuration).flatMap(() => {
        logger.info(`rxFetchRankScore ${new Date()}`);
        if (isNaN(global.userCount)) {
            logger.info(`user count is NaN needn't fetch Rank ${ServerConfig.userCount} ${global.userCount}`);
            throw Error('user count is NaN');
        }
        let groupCount = Math.round(global.userCount / 20);
        logger.info(`current user score group count ${groupCount}`);
        return user.fetchRankExp(groupCount > 0 ? groupCount : 1);
    }).subscribe(next => {
        logger.info(`rxFetchRankScore next ${JSON.stringify(next)}`);
        rankExp = next;
        logger.info(`print ServerConfig ${JSON.stringify(ServerConfig)}`);
    }, error => {
        logger.info(`error fetch rank score ${error}`);
    })
}

function calUserRanks(curExp) {
    logger.info(`calUserRanks start ${curExp}`);
    return rx.Observable.from(rankExp)
        .first(it => it.curExp <= curExp)
        .map(it => Math.floor(it.ranks / (rankExp.length) * 100))
        .doOnError(
            error => {
                logger.info(`calUserRanks ${error}`)
                return rx.Observable.just(100);
            }
        );
}

module.exports = {
    ServerConfig,
    calUserRanks,
    rxFetchUserCount,
    rxFetchRankScore,
    rxRanksTimeTask,
}