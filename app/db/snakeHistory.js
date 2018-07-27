var db = require('./mysqlPool');

var logger = require('../logger').logger('history', 'info');

/**
 * create histroy 
 * @param {*} callback 
 */
var createHistoryTable = function (callback) {
    let createTableSql = `CREATE TABLE IF NOT EXISTS snake.history (
        id int not null auto_increment,
        openId varchar(256) NOT NULL COMMENT 'user open id',
        gameType bool NOT NULL default 0 COMMENT 'game model time:0, endless:1',
        score	int NOT NULL default 0 COMMENT 'game score',
        length int NOT NULL default 0 COMMENT 'snake legnth',
        bestKill int NOT NULL default 0 COMMENT 'kill num',
        linkKill int NOT NULL default 0 COMMENT 'game linked kill num',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX (openId)
    ) COMMENT 'game history',
     ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`

    db.con(function (connection) {
        connection.query(createTableSql, function (err, res) {
            if (err) {
                logger.error(`[Event|create table] ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
                callback(null, res);
            }
        })
    });
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
                    score,
                    length,
                    bestKill,
                    linkKill) 
                values(
                    '${history.openid}',
                    ${history.game_model}
                    ${history.game_score},
                    ${history.length},
                    ${history.bestKill},
                    ${history.linkKill}
                );`;


    db.con(function (connection) {
        connection.query(addSql, function (err, res) {
            if (err) {
                logger.error(`[Event|add] err ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|add] ok ${JSON.stringify(res)}`);
                callback(null, res);
            }
        });
    })
}

/**
 * query user history
 * @param {*} openid 
 * @param {*} limit 
 * @param {*} callback 
 */
var queryHistory = function (openid, limit, callback) {
    let query = `select * from snake.history where openid='${openid}' order by id desc limit 0,${limit > 0 ? limit : 500}`;

    db.con(function (connection) {

        connection.query(query, function (err, res) {
            if (err) {
                logger.error(`[Event|query] err ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|query]ok ${JSON.stringify(res)}`);
                callback(null, res);
            }
        });
    })
}

module.exports = {
    createHistoryTable,
    addHistory,
    queryHistory,
}