const db = require('./mysqlPool');
const logger = require('../logger').logger('history', 'info');

/**
 * create histroy 
 * @param {*} callback 
 */
function createHistoryTable (callback) {
    let createSql = `CREATE TABLE IF NOT EXISTS snake.history (
        id          int  NOT NULL auto_increment,
        openId      varchar(256) NOT NULL COMMENT 'user open id',
        gameType    bool NOT NULL default 0 COMMENT 'game model time:0, endless:1',
        roundRank   int  NOT NULL default -1 comment 'game rank',
        liveTime    int  NOT NULL default 0 comment 'live time when endless model',
        length      int  NOT NULL default 0 COMMENT 'snake legnth',
        bestKill    int  NOT NULL default 0 COMMENT 'kill num',
        linkKill    int  NOT NULL default 0 COMMENT 'game linked kill num',
        deadTimes   int  NOT NULL default 0 COMMENT 'dead times this round',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX (openId)
    ) COMMENT 'game history',
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`
    return db.rxQuery(createSql, null);
}

/**
 * add game history 
 * @param {*} history 
 * @param {*} callback 
 */
function addHistory (history, callback) {
    let addSql = `insert into snake.history (
                    openId, 
                    gameType,
                    roundRank,
                    liveTime,
                    length,
                    bestKill,
                    linkKill,
                    deadTimes) 
                values(
                    '${history.openId}',
                    ${history.gameType},
                    ${history.roundRank},
                    ${history.liveTime},
                    ${history.length},
                    ${history.bestKill},
                    ${history.linkKill},
                    ${history.deadTimes}
                );`;

    logger.info(`add history ${addSql}`);
    return db.rxQuery(addSql, null).map(it=>it.insertId);
}

/**
 * query user history
 * @param {*} openId 
 * @param {*} limit 
 * @param {*} callback 
 */
function queryHistory (openId, limit, callback) {
    let querySql = `select * from snake.history where openId='${openId}' order by id desc limit 0,${limit > 0 ? limit : 500}`;
    logger.info(`query history ${querySql}`);
    return db.rxQuery(querySql, null);
}
module.exports = {
    createHistoryTable,
    addHistory,
    queryHistory,
}