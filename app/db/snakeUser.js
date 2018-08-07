const db = require('./mysqlPool');
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
            ${user.gender},
            "${user.language}",
            "${user.province}",
            "${user.city}",
            "${user.country}",
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

function queryUpdateInfo(openId) {
    let queryFields = 'openId, grade, honorNum, score, curExp, nextGradeExp, ranks, t_length, t_bestKill, t_linkKill, e_length, e_bestKill, e_linkKill';
    let queryUser = `select ${queryFields} from snake.user where openId='${openId}';`;
    logger.info(`[exec sql] ${queryUser}`);
    return db.rxQuery(queryUser).map(it => it[0]);
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
        score = ${user.score},
        grade = ${user.grade},
        curExp = ${user.curExp},
        nextGradeExp = ${user.nextGradeExp}
        where openId='${user.openId}';`
    logger.info(`[exec sql] ${updateHistorySql}`);
    return db.rxQuery(updateHistorySql).map(it => it.changedRows > 0);
}

function getUserCount() {
    return db.rxQuery('select count(openId) as count from snake.user;').map(it => it[0].count);
}

function sortUserScore() {
    let sortUserSql = `update user, (select row_number() over (order by score desc) as ranks, openId from user) as sorts set user.ranks=sorts.ranks where user.openId=sorts.openId;`;
    logger.info(`[exec sql] ${sortUserSql}`);
    return db.rxQuery(sortUserSql);
}

function sortUserScoreSingle(openId) {
    let sortUserSql = `select sorts.ranks from (select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user) as sorts where openId='${openId}';`;
    return db.rxQuery(sortUserSql);
}

function fetchRankScore(count) {
    let rankScoreSql = `select row_number() over (order by score desc) as ranks, score from user where ranks%${count}=0;`
    return db.rxQuery(rankScoreSql);
}

module.exports = {
    createUserTable,
    insertUserInfo,
    queryUserInfo,
    updateLoginTime,
    updateHistoryInfo,
    queryUpdateInfo,
    getUserCount,
    sortUserScore,
    fetchRankScore,
    sortUserScoreSingle,
}