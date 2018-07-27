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
        honor  varchar(256) NOT NULL COMMENT 'player current honor',
        honorNum  int NOT NULL COMMENT 'gain honor number',
        skin  int NOT NULL COMMENT 'player current skin id',
        skinNum int NOT NULL COMMENT 'user own skin num',
        curExp  int NOT NULL COMMENT 'player current exp num',
        nextGradeExp  int NOT NULL COMMENT 'next grade exp',
        t_bestLen int NOT NULL default 0 COMMENT 'best body length',
        t_mostKill int NOT NULL default 0 COMMENT 'most kill number',
        t_linkKill int NOT NULL default 0 COMMENT 'best link kill number',
        e_bestLen int NOT NULL default 0 COMMENT 'best body length',
        e_mostKill int NOT NULL default 0 COMMENT 'most kill number',
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
var insertUserInfo = function (openid, nickName, callback) {
    logger.info(`insert User info ...`);
    var user = new bean.User();
    user.openid = openid;
    user.nickName = nickName;

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
        );`
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
    let queryUser = `select * from snake.user where openid=${openid};`;
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
    let updateLoginTime = `update snake.user set updateTime=CURRENT_TIMESTAMP where openid='${openid}';`;

    db.con(function (connection) {
        connection.query(updateLoginTime, function (err, res) {
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
 * @param {*} history 
 */
var updateHistoryInfo = function (user) {
    let updateHistorySql = `update snake.user set
        t_bestLen = ${user.t_bestLen},
        t_mostKill = ${user.t_mostKill},
        t_linkKill = ${user.t_linkKill},
        e_bestLen = ${user.e_bestLen},
        e_mostKill = ${user.e_mostKill},
        e_linkKill = ${user.e_linkKill} where openId=${user.openId};`
    db.con(function (connection) {
        connection.query(updateHistorySql, function (err, res) {
            if (err) {
                logger.info(`[Event|update History query] error ${JSON.stringify(err)}`);
            } else {
                logger.info(`[Event|update History query] ok ${JSON.stringify(res)}`);
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