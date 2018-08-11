const db = require('./mysqlPool');
const dao = require('./daoBean');
const rx = require('rx');
const logger = require('../logger').logger('user', 'info');


/**
 * create user table , when app first start 
 * @param {callback} callback 
 */
function createUserTable(callback) {
    let createSql = `CREATE TABLE IF NOT EXISTS snake.user (
        id          int NOT NULL AUTO_INCREMENT,
        openId      varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName    varchar(256) NOT NULL ,
        headUri     varchar(256) COMMENT 'head uri',
        gender      int default 0 COMMENT 'user gender',
        language    varchar(64) COMMENT 'user language',
        province    varchar(64) COMMENT 'user province',
        city        varchar(64) COMMENT 'user city',
        country     varchar(64) COMMENT 'user country',
        grade       int NOT NULL default 0 COMMENT 'user grade',
        gradeName   varchar(256) NOT NULL COMMENT 'player current honor',
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
        liveTime    int NOT NULL default 0 COMMENT 'endless live time',
        winCount    int NOT NULL default 0 COMMENT 'win count',
        winHonor    int NOT NULl default 10 COMMENT 'win honor level',
        killHonor   int NOT NULL default 22 COMMENT 'kill honor level',
        linkKillHonor int NOT NULL default 32 COMMENT 'link kill honor level',
        lengthHonor int NOT NULL default 41 COMMENT 'length honor level',
        timeHonor   int NOT NULL default 51 COMMENT 'live time honor level',
        skinHonor   int NOT NULL default 82 COMMENT 'skin num level',
        nextGradeExp  int NOT NULL COMMENT 'next grade exp',
        latestLogin TIMESTAMP COMMENT 'latest login time',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        updateTime  TIMESTAMP default NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX (openId),
        UNIQUE (openId)
    ) COMMENT = 'snake user info', 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`
    logger.info(`[exec sql] ${createSql}`);
    return db.rxQuery(createSql);
}

/**
 * 新增游戏玩家
 * @param {*} openId 
 * @param {*} nickName 
 */
function insertUserInfo(user) {

    let insertUser = `INSERT INTO snake.user (
            openId,
            nickName,
            headUri,
            gender,
            language,
            province,
            city,
            country,
            grade,
            gradeName,
            honorNum,
            skin,
            skinNum,
            curExp,
            nextGradeExp, 
            latestLogin) 
        values(
            '${user.openId}',
            '${user.nickName}',
            '${user.headUri}',
            ${user.gender},
            '${user.language}',
            '${user.province}',
            '${user.city}',
            '${user.country}',
            ${user.grade},
            '${user.gradeName}',
            ${user.honorNum},
            ${user.skin},
            ${user.skinNum},
            ${user.curExp},
            ${user.nextGradeExp},
            current_timestamp()
        );`;
    logger.info(`[exec sql] ${insertUser}`);
    return db.rxQuery(insertUser).map(res => res.insertId);
}

/**
 * 通过openId查询玩家信息
 * @param {*} openId 
 * @param {*} callback 
 */
function queryUserInfo(openId) {
    let queryUser = `select * from snake.user where openId='${openId}';`;
    logger.info(`[exec sql] ${queryUser}`);
    return db.rxQuery(queryUser);
}

/**
 * 通过openId查询玩家信息
 * @param {*} id 
 * @param {*} callback 
 */
function queryUserInfoWithId(id) {
    let queryUser = `select * from snake.user where id='${id}';`;
    logger.info(`[exec sql] ${queryUser}`);
    return db.rxQuery(queryUser);
}

function queryUpdateInfo(openId) {
    let queryUser = `select * from snake.user where openId='${openId}';`;
    logger.info(`[exec sql] ${queryUser}`);
    return db.rxQuery(queryUser).map(it => it[0]);
}

function isRegisteredUser(openId) {
    let querySql = 'select count(openId) as res from user where openId = ' + openId + ';';
    logger.info(`[exec sql] ${querySql}`);
    return db.rxQuery(querySql).map(it => it.res > 0);
}

/**
 * update user latest login time;
 * @param {*} openId 
 * @param {*} callback 
 */
function updateLoginTime(openId) {
    let updateLoginTimeSql = `update snake.user set updateTime=CURRENT_TIMESTAMP where openId='${openId}';`;
    logger.info(`[exec sql] ${updateLoginTimeSql}`);
    return db.rxQuery(updateLoginTimeSql).map(it => it.changedRows > 0);
}

/**
 * when upload history sync judge it's need update user records info ?
 * 
 * @param {*} user
 */
function updateHistoryInfo(user) {
    let updateHistorySql = `update snake.user set
        t_length = ${user.t_length},
        t_bestKill = ${user.t_bestKill},
        t_linkKill = ${user.t_linkKill},
        e_length = ${user.e_length},
        e_bestKill = ${user.e_bestKill},
        e_linkKill = ${user.e_linkKill},
        liveTime = ${user.liveTime},
        grade = ${user.grade},
        gradeName = '${user.gradeName}',
        curExp = ${user.curExp},
        nextGradeExp = ${user.nextGradeExp},
        winCount = ${user.winCount},
        winHonor = ${user.winHonor},
        killHonor = ${user.killHonor},
        linkKillHonor = ${user.linkKillHonor},
        lengthHonor = ${user.lengthHonor},
        timeHonor = ${user.timeHonor},
        skinHonor = ${user.skinHonor}
        where openId='${user.openId}';`
    logger.info(`[exec sql] ${updateHistorySql}`);
    return db.rxQuery(updateHistorySql).map(it => it.changedRows > 0);
}

function updateHonors(openId, honors, honorNum) {
    let updateHonorSql = `update snake.user set
    honorNum = ${honorNum},
    winHonor = ${honors[0]},
    killHonor = ${honors[1]},
    linkKillHonor = ${honors[2]},
    lengthHonor = ${honors[3]},
    timeHonor = ${honors[4]},
    skinHonor = ${honors[5]}
    where openId='${openId}} ';`;
    logger.info(`[exec sql] ${updateHonorSql}`);
    return db.rxQuery(updateHonorSql).map(it => it.changedRows > 0);
}

function getUserCount() {
    return db.rxQuery('select count(openId) as count from user;').map(it => it[0].count);
}

function sortUserExp() {
    let sortUserSql = `update user, (select row_number() over (order by curExp desc) as ranks, openId from user) as sorts set user.ranks=sorts.ranks where user.openId=sorts.openId;`;
    logger.info(`[exec sql] ${sortUserSql}`);
    return db.rxQuery(sortUserSql);
}

function sortUserExpSingle(openId) {
    let sortUserSql = `select sorts.ranks from (select row_number() over(order by curExp desc) as ranks, curExp, openId from snake.user) as sorts where openId='${openId}';`;
    return db.rxQuery(sortUserSql);
}

function fetchRankExp(count) {
    let rankScoreSql = `select row_number() over (order by curExp desc) as ranks, curExp from user where ranks%${count}=0 ;`
    return db.rxQuery(rankScoreSql);
}

module.exports = {
    createUserTable,
    insertUserInfo,
    queryUserInfo,
    queryUserInfoWithId,
    updateHonors,
    updateLoginTime,
    updateHistoryInfo,
    queryUpdateInfo,
    getUserCount,
    sortUserExp,
    fetchRankExp,
    sortUserExpSingle,
}