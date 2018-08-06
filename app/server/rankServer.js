var logger = require('../logger').logger('ranks', 'info');
var user = require('../db/snakeUser');

var rx = require('rx');

shortDelay = 2 * 1000;
shortUpdateDuration = 60 * 1000;

longDelay = shortDelay * 5;
longUpdateDuration = shortUpdateDuration * 5;

var sysConfig = function () {
    this.userCount = 0;
    this.payCount = 0;
    this.rankScore = [];
}

var ServerConfig = new sysConfig();

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
        return user.sortUserScore();
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
        if(isNaN(global.userCount)){
            logger.info(`user count is NaN needn't fetch Rank ${ServerConfig.userCount} ${global.userCount}`);
            throw Error('user count is NaN');
        }
        var groupCount = parseInt(global.userCount / 20) + 1;
        logger.info(`current user score group count ${groupCount}`);
        return user.fetchRankScore(groupCount);
    }).subscribe(next => {
        logger.info(`rxFetchRankScore next ${typeof(next)}`);
        if (next.length < 20) {
            next.push(JSON.parse('{"ranks":20,"score":0}'));
        }
        this.rankScore = next;
        ServerConfig.rankScore = next;


        logger.info(`print ServerConfig ${JSON.stringify(ServerConfig)}`);
    }, error => {
        logger.info(`error fetch rank score ${error}`);
    })
}

module.exports = {
    ServerConfig,
    rxFetchUserCount,
    rxFetchRankScore,
    rxRanksTimeTask,
}