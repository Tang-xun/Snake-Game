const db = require('./mysqlPool');
const logger = require('../logger').logger('fetchApp', 'info');

function createFetchApp() {
    let createSql = `CREATE TABLE IF NOT EXISTS snake.fetchApp (
        id int NOT NULL AUTO_INCREMENT,
        openId varchar(256) not null ,
        fetchTime TIMESTAMP not null COMMENT 'user latest fetch app time',
        createTime  TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX (openId),
        UNIQUE (openId)
    ) COMMENT 'record user latest fetch app action'`;
    logger.info(`[will exec] ${createSql}`);
    return db.rxQuery(createSql);
}

function queryFetchTime(openId) {
    let querySql = `select fetchTime from snake.fetchApp where openId = '${openId}';`;
    logger.info(`[will exec] ${querySql}`);
    return db.rxQuery(querySql).map(it => it[0].fetchTime);
}

function updateFetchTime(openId) {
    let updateSql = `INSERT INTO snake.fetchApp (openId, fetchTime) 
        values('${openId}', current_timestamp()) 
        ON DUPLICATE KEY UPDATE  fetchTime = current_timestamp();`;
    logger.info(`[will exec] ${updateSql}`);
    return db.rxQuery(updateSql).map(it => it[0].insertId > 0);
}

module.exports = {
    createFetchApp,
    queryFetchTime,
    updateFetchTime,
}