const dao = require('./mysqlPool');
const logger = require('../logger').logger('honor-record', 'info');

function createHonorRecordsTable() {
    let createSql = `create table if not exists snake.honorRecords (
        id              int NOT NULL auto_increment comment 'id',
        openId          varchar(256) not null comment 'openId',
        honorId         int not null comment 'honorId',
        honorName       varchar(32) not null comment 'honor name',
        createTime      TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        shareContent    varchar(256) NOT NULL comment 'share content',
        PRIMARY KEY (id)
    ) comment 'Honor Records' 
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`;

    logger.info(`[exec sql] ${createSql}`);
    return dao.rxQuery(createSql);
}

function addHonorRecords(bean) {
    logger.info(`addHonorRecords ${JSON.stringify(bean)}`);
    let addSql = `insert into snake.honorRecords (
        openId,
        honorId,
        honorName,
        shareContent
    ) values (
        '${bean.openId}',
        ${bean.id},
        '${bean.name}',
        '${bean.shareContent}'
    );`

    logger.info(`[exec sql] ${addSql}`);
    return dao.rxQuery(addSql);
}

function queryUserHonor(openId) {
    let querySql = `select * from snake.honorRecords where openId='${openId}';`;
    logger.info(`[exec sql] ${querySql}`);
    return dao.rxQuery(querySql);
}

module.exports = {
    createHonorRecordsTable,
    queryUserHonor,
    addHonorRecords,
}