var config = require('../config');
var db = require('./mysqlPool');
var bean = require('./daoBean');

var logger = require('../logger').logger('user', 'info');

var RX = require('rxjs');

var rx = require('rx');

/**
 * create user table , when app first start 
 * @param {callback} callback 
 */
var createUserTable = function (callback) {
    let createSql = `CREATE TABLE IF NOT EXISTS snake.user (
        id          int NOT NULL AUTO_INCREMENT,
        openId      varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName    varchar(256) NOT NULL ,
        headUri     varchar(256) ,
        grade       int NOT NULL default 0 COMMENT 'user grade',
        honor       varchar(256) NOT NULL COMMENT 'player current honor',
        score       int NOT NULL default 0 COMMENT 'user score',
        honorNum    int NOT NULL COMMENT 'gain honor number',
        skin        int NOT NULL COMMENT 'player current skin id',
        skinNum     int NOT NULL COMMENT 'user own skin num',
        curExp      int NOT NULL COMMENT 'player current exp num',
        ranks       int NOT NULL default 0 COMMENT 'player ranks',
        t_length    int NOT NULL default 0 COMMENT 'best body length',
        t_bestKill  int NOT NULL default 0 COMMENT 'most kill number',
        t_linkKill  int NOT NULL default 0 COMMENT 'best link kill number',
        e_length    int NOT NULL default 0 COMMENT 'best body length',
        e_bestKill  int NOT NULL default 0 COMMENT 'most kill number',
        e_linkKill  int NOT NULL default 0 COMMENT 'best link kill number',
        nextGradeExp  int NOT NULL COMMENT 'next grade exp',
        latestLogin TIMESTAMP COMMENT 'latest login time',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        updateTime  TIMESTAMP default NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX (openId),
        UNIQUE (openId)
    ) COMMENT = 'snake user info', 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`
    return RX.bindCallback(db.query)(createSql);
}

/**
 * 新增游戏玩家
 * @param {*} openid 
 * @param {*} nickName 
 */
var insertUserInfo = function (user, callback) {
    
    let insertUser = `INSERT INTO snake.user (
            openId, 
            nickName, 
            headUri, 
            honor,
            score,
            grade,
            honorNum, 
            skin, 
            skinNum, 
            curExp, 
            nextGradeExp, 
            latestLogin) 
        values(
            "${user.openId}", 
            "${user.nickName}", 
            "${user.headUri}",
            "${user.honor}", 
            ${user.score},
            ${user.grade},
            ${user.honorNum}, 
            ${user.skin}, 
            ${user.skinNum}, 
            ${user.curExp}, 
            ${user.nextGradeExp},
            current_timestamp()
        );`;
    logger.info(`[exec sql] ${insertUser}`);
    return RX.bindCallback(db.query)(insertUser);
}

/**
 * 通过openid查询玩家信息
 * @param {*} openid 
 * @param {*} callback 
 */
var queryUserInfo = function (openid, callback) {
    let queryUser = `select * from snake.user where openid='${openid}';`;
    logger.info(`[exec sql] ${queryUser}`);
    return RX.bindCallback(db.query)(queryUser);
}

/**
 * update user latest login time;
 * @param {*} openid 
 * @param {*} callback 
 */
var updateLoginTime = function (openid, callback) {
    let updateLoginTimeSql = `update snake.user set updateTime=CURRENT_TIMESTAMP where openid='${openid}';`;
    logger.info(`[exce sql] ${updateLoginTimeSql}`);
    return RX.bindCallback(db.query)(updateLoginTimeSql);
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
        score = ${user.score},
        ranks = (select sorts.s from (select row_number() over (order by score desc) as s, openId, score from user) as sorts where openId='${user.openId}'),
        grade = ${user.grade},
        curExp = ${user.curExp},
        nextGradeExp = ${user.nextGradeExp}
        where openId='${user.openId}';`
    logger.info(`[exce sql] ${updateHistorySql}`);
    return RX.bindCallback(db.query)(updateHistorySql);
}

/**
 * query user count 
 * @param {*} callback 
 */
var getUserCount = function () {
    // return RX.bindCallback(db.query)('select count(openId) as count from snake.user;');
    // return rx.Observable.fromCallback(db.query)('select count(openId) as count from snake.user;');
    return db.rxQuery('select count(openId) as count from snake.user;', null);
}

/**
 * query user score sorted
 * @param {*} callback 
 */
var sortUserScore = function () {
    let sortUserSql = `select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user;`;
    return db.rxQuery(sortUserSql, null);
}

var sortUserScoreSingle = function (openId) {
    let sortUserSql = `select sorts.ranks from (select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user) as sorts where openId='${openId}';`;
    return RX.bindCallback(db.query)(sortUserSql);
}

module.exports = {
    createUserTable,
    insertUserInfo,
    queryUserInfo,
    updateLoginTime,
    updateHistoryInfo,
    getUserCount,
    sortUserScore,
    sortUserScoreSingle,
}