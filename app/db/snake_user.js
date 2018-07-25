var config = require('../config');
var db = require('./comonPool');

var logger = require('../logger').logger('sanke_user', 'info');

// data bean
var User = function () {
    openid;
    nickName;
    honor = '小青蛇';
    honorNum = 0;
    skin = 1;
    curExp = 0;
    // 下一升级等级
    nextGradeExp = 500;
    t_bestLen = 0;
    t_mostKill = 0;
    t_linkKill = 0;
    e_bestLen = 0;
    e_mostKill = 0;
    e_linkKill = 0;
    latestLogin;
    updateTime;
    createTime;
}

/**
 * create user table , when app first start 
 * @param {callback} callback 
 */
var createUserTable = function (callback) {
    console.time();
    let userTable = `create table if not exists user (
        _id int NOT NULL AUTO_INCREMENT,
        openId  varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName  varchar(256) NOT NULL ,
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
        updateTime  TIMESTAMP on update CURRENT_TIMESTAMP,
        PRIMARY KEY ( _id ),
        INDEX (openId),
        unique (openId)
    ) COMMENT = 'snake user info', 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`

    db.con(function (connection) {
        logger.info(`userTable ${userTable}`);
        connection.query(userTable, function (err, res) {
            if (err) {
                logger.error(`[Event|create table] ::: error : ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|create table] ::: ok : ${JSON.stringify(res)}`);
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
    var user = new User();
    user.openid = openid;
    user.nickName = nickName;

    let insertUser = `insert into snake.user 
        (openID, nickName, honor, honorNum, skin, skinNum, curExp, nextGradeExp, latestLogin) 
        values(
            "${user.openid}", 
            "${user.nickName}", 
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
                logger.error(`[Event|insert] error ::: ${JSON.stringify(err)}`);
                callback(err, null);

            } else {
                logger.info(`[Event|insert] ok ::: ${JSON.stringify(res)}`);
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
    db.con(function (connection) {
        connection.query(queryUser, function (err, res) {
            if (err) {
                logger.error(`[Event| query] ${openid} error ::: ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event| query] ${openid} ok ::: ${JSON.stringify(res)}`);
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

module.exports = {
    User,
    createUserTable,
    insertUserInfo,
    queryUserInfo,
    updateLoginTime,
    toString,
}