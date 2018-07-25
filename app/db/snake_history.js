var db = require('./comonPool');

var logger = require('../logger').logger('sanke_history', 'info');

var history = function () {
    opendid;
    game_model = 0;
    game_score = 0;
    length = 0;
    bestKill = 0;
    linkKill = 0;
}

/**
 * create histroy 
 * @param {*} callback 
 */
var createHistoryTable = function (callback) {
    let createTableSql = `create table if not exists snake.history (
        _id int not null auto_increment,
        openId varchar(256) not null comment 'user open id',
        gameType bool not null default 0 comment 'game model time:0, endless:1',
        score	int not null default 0 comment 'game score',
        length int not null default 0 comment 'snake legnth',
        bestKill int not null default 0 comment 'kill num',
        linkKill int not null default 0 comment 'game linked kill num',
        PRIMARY KEY (_id),
        INDEX (openId)
    ) comment 'game history',
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
                    '${history.opendid}',
                    ${history.game_model}
                    ${history.game_score},
                    ${history.length},
                    ${history.bestKill},
                    ${history.linkKill}
                )`
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
    history,
    createHistoryTable,
    addHistory,
    queryHistory,
}