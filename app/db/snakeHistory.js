var db = require('./mysqlPool');
var logger = require('../logger').logger('history', 'info');

/**
 * create histroy 
 * @param {*} callback 
 */
var createHistoryTable = function (callback) {
    let createSql = `CREATE TABLE IF NOT EXISTS snake.history (
        id          int  NOT NULL auto_increment,
        openId      varchar(256) NOT NULL COMMENT 'user open id',
        gameType    bool NOT NULL default 0 COMMENT 'game model time:0, endless:1',
        exp         int  NOT NULL default 0 COMMENT 'exp increament',
        length      int  NOT NULL default 0 COMMENT 'snake legnth',
        bestKill    int  NOT NULL default 0 COMMENT 'kill num',
        linkKill    int  NOT NULL default 0 COMMENT 'game linked kill num',
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
var addHistory = function (history, callback) {
    let addSql = `insert into snake.history (
                    openId, 
                    gameType,
                    exp,
                    length,
                    bestKill,
                    linkKill) 
                values(
                    '${history.openId}',
                    ${history.gameType},
                    ${history.exp},
                    ${history.length},
                    ${history.bestKill},
                    ${history.linkKill}
                );`;

    logger.info(`add history ${addSql}`);
    return db.rxQuery(addSql, null);
}

/**
 * query user history
 * @param {*} openId 
 * @param {*} limit 
 * @param {*} callback 
 */
var queryHistory = function (openId, limit, callback) {
    let querySql = `select * from snake.history where openId='${openId}' order by id desc limit 0,${limit > 0 ? limit : 500}`;
    logger.info(`query history ${querySql}`);
    return db.rxQuery(querySql, null);
}

module.exports = {
    createHistoryTable,
    addHistory,
    queryHistory,
}