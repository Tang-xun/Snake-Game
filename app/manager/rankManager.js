const rx = require('rx');

const logger = require('../logger').logger('ranks', 'info');
const user = require('../db/snakeUser');


let shortDelay = 2 * 1000;
let shortUpdateDuration = 5 * 60 * 1000;

let longDelay = shortDelay * 2;
let longUpdateDuration = shortUpdateDuration * 2;

let rankScore = [];
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
        return user.fetchRankExp(groupCount);
    }).subscribe(next => {
        logger.info(`rxFetchRankScore next ${typeof (next)}`);
        if (next.length < 20) {
            next.push(JSON.parse('{"ranks":20,"score":0}'));
        }
        rankScore = next;

        logger.info(`print ServerConfig ${JSON.stringify(ServerConfig)}`);
    }, error => {
        logger.info(`error fetch rank score ${error}`);
    })
}

function calUserRanks(score) {
    logger.info(`calUserRanks start ${score}`);
    return rx.Observable.from(rankScore)
        .first(it => it.score <= score)
        .map(it => parseFloat(it.ranks / 20) * 100).doOnError(
            error => {
                return rx.Observable.just(100);
            }
        )
}

module.exports = {
    ServerConfig,
    calUserRanks,
    rxFetchUserCount,
    rxFetchRankScore,
    rxRanksTimeTask,
}