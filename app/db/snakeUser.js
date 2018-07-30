var config = require('../config');
var db = require('./mysqlPool');
var bean = require('./daoBean');

var logger = require('../logger').logger('user', 'info');

/**
 * create user table , when app first start 
 * @param {callback} callback 
 */
var createUserTable = function (callback) {
    console.time();
    let userTable = `CREATE TABLE IF NOT EXISTS snake.user (
        id int NOT NULL AUTO_INCREMENT,
        openId  varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName  varchar(256) NOT NULL ,
        headUri varchar(256) ,
        grade int NOT NULL default 0 COMMENT 'user grade',
        honor  varchar(256) NOT NULL COMMENT 'player current honor',
        honorNum  int NOT NULL COMMENT 'gain honor number',
        skin  int NOT NULL COMMENT 'player current skin id',
        skinNum int NOT NULL COMMENT 'user own skin num',
        curExp  int NOT NULL COMMENT 'player current exp num',
        nextGradeExp  int NOT NULL COMMENT 'next grade exp',
        t_length int NOT NULL default 0 COMMENT 'best body length',
        t_bestKill int NOT NULL default 0 COMMENT 'most kill number',
        t_linkKill int NOT NULL default 0 COMMENT 'best link kill number',
        e_length int NOT NULL default 0 COMMENT 'best body length',
        e_bestKill int NOT NULL default 0 COMMENT 'most kill number',
        e_linkKill int NOT NULL default 0 COMMENT 'best link kill number',
        latestLogin  TIMESTAMP COMMENT 'latest login time',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        updateTime  TIMESTAMP default NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX (openId),
        UNIQUE (openId)
    ) COMMENT = 'snake user info', 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`

    db.con(function (connection) {
        connection.query(userTable, function (err, res) {
            if (err) {
                logger.error(`[Event|create tableerror : ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|create tableok : ${JSON.stringify(res)}`);
                callback(null, res);
            }
        });
    })
}

/**
 * 新增游戏玩家
 * @param {*} openid 
 * @param {*} nickName 
 */
var insertUserInfo = function (user, callback) {
    logger.info(`insert User info ...`);

    let insertUser = `INSERT INTO snake.user (
            openID, 
            nickName, 
            headUri, 
            honor, 
            honorNum, 
            skin, 
            skinNum, 
            curExp, 
            nextGradeExp, 
            latestLogin) 
        values(
            "${user.openid}", 
            "${user.nickName}", 
            "${user.headUri}",
            "${user.honor}", 
            ${user.honorNum}, 
            ${user.skin}, 
            ${user.skinNum}, 
            ${user.curExp}, 
            ${user.nextGradeExp},
            current_timestamp()
        );`;
    logger.info(`will exce sql ${insertUser}`);
    db.con(function (connection) {
        connection.query(insertUser, function (err, res) {
            if (err) {
                logger.error(`[Event|insert] error  ${JSON.stringify(err)}`);
                callback(err, null);

            } else {
                logger.info(`[Event|insert] ok  ${JSON.stringify(res)}`);
                callback(null, res);
            }

        })
    })
}

/**
 * 通过openid查询玩家信息
 * @param {*} openid 
 * @param {*} callback 
 */
var queryUserInfo = function (openid, callback) {
    let queryUser = `select * from snake.user where openid='${openid}';`;
    logger.info(`will exec sql ${queryUser}`);
    db.con(function (connection) {
        connection.query(queryUser, function (err, res) {
            if (err) {
                logger.error(`[Event| query] ${openid} error  ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event| query] ${openid} ok  ${JSON.stringify(res)}`);
                callback(null, res);
            }
        });
    });
}

/**
 * update user latest login time;
 * @param {*} openid 
 * @param {*} callback 
 */
var updateLoginTime = function (openid, callback) {
    let updateLoginTimeSql = `update snake.user set updateTime=CURRENT_TIMESTAMP where openid='${openid}';`;
    logger.info(`will exce sql ${updateLoginTimeSql}`);
    db.con(function (connection) {
        connection.query(updateLoginTimeSql, function (err, res) {
            if (err) {
                logger.info(`[Event|sign ] error ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|sign ] OK ${JSON.stringify(res)}`);
                callback(null, res);
            }
        });
    })
}

/**
 * when upload history sync judge it's need update user records info ?
 * 
 * @param {*} user
 */
var updateHistoryInfo = function (user) {
    let updateHistorySql = `update snake.user set
        t_length = ${user.t_length},
        t_bestKill = ${user.t_bestKill},
        t_linkKill = ${user.t_linkKill},
        e_length = ${user.e_length},
        e_bestKill = ${user.e_bestKill},
        e_linkKill = ${user.e_linkKill},
        grade = ${user.grade},
        curExp = ${user.curExp},
        nextGradeExp = ${user.nextGradeExp}
        where openId='${user.openId}';`
    logger.info(`will exce sql ${updateHistorySql}`);
    db.con(function (connection) {
        connection.query(updateHistorySql, function (err, res) {
            if (err) {
                logger.info(`[Event|update History] error ${JSON.stringify(err)}`);
            } else {
                logger.info(`[Event|update History] ok ${JSON.stringify(res)}`);
            }
        })
    });
}

module.exports = {
    createUserTable,
    insertUserInfo,
    queryUserInfo,
    updateLoginTime,
    updateHistoryInfo,
    toString,
}