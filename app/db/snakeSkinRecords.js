const dao = require('./mysqlPool');
const logger = require('../logger').logger('honor-record', 'info');

function createSkinRecords() {
    let createSql = `create table if not exists skinRecords (
        id          int NOT NULL AUTO_INCREMENT,
        openId      varchar(256) NOT NULL COMMENT 'user openId',
        type        int NOT NULL DEFAULT 0 COMMENT 'skin type',
        name        varchar(64) NOT NULL COMMENT 'skin name',
        uri         varchar(256) COMMENT 'skin download uri',
        expired     bool NOT NULL COMMENT 'skin expired flag',
        createTime  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create order time',
        updateTime  TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        expiredTime varchar(128) NOT NULL COMMENT 'skin expired time',
        PRIMARY KEY (id),
        INDEX (openId, name)
    ) COMMENT = 'snake user info', 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`;
    logger.info('[exec sql] ' + createSql);
    return dao.rxQuery(createSql);
}

function addSkinRecord(skinBean) {
    let addSql = 'insert into skinRecords ('

    let keySql = Object.keys(skinBean).join(',');
    let valueSql = Object.values(skinBean).map(it => typeof (it) == 'string' ? `'${it}'` : it);
    addSql += keySql;
    addSql += ') values (';
    addSql += valueSql;
    addSql += ');';
    logger.info('[exec sql] ' + addSql);

    return dao.rxQuery(addSql).map(res => res.insertId);
}

function querySkinRecords(openId) {
    let querySql = 'select * from skinRecords where openId = \'' + openId + '\';';
    logger.info('[exec sql] ' + querySql);
    return dao.rxQuery(querySql);
}

module.exports = {
    addSkinRecord,
    querySkinRecords,
    createSkinRecords,
}
