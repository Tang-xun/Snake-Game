const db = require('./mysqlPool');
const logger = require('../logger').logger('user', 'info');

function createTable() {
    let createSql = `
    CREATE TABLE IF NOT EXISTS snake.honor (
        id              int NOT NULL auto_increment comment 'honorId',
        name            varchar(32) NOT NULL comment 'honorName',
        gameType        int NOT NULL comment 'judge v game type{0:time, 1:endless, 2:any}',
        gainType        int NOT NULL comment 'judge honor gain type {0:gameRank, 1:gameTotalRank, 2:kill, 3:linkKill, 4:length, 5:time, 6:weekWrodRank, 7:weekFriendRank, 8:skinNum}',
        v               int NOT NULL comment 'gain v',
        rewardExp       int NOT NULL comment 'reward exp',
        skinType         int DEFAULT NULL comment 'reward skin',
        shareContent    varchar(256) NOT NULL comment 'share content',
        createTime      TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
        updateTime      TIMESTAMP default NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE (name)
    ) comment 'honor tables'
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`
    logger.info(`[exec sql] ${createSql}`);
    return db.rxQuery(createSql);
}

function addHonor(honor) {
    let addSql = `
        insert into snake.honor (
            name,
            gameType,
            gainType,
            v,
            rewardExp,
            skinType,
            shareContent
        ) values(
            '${honor.name}',
            ${honor.gameType},
            ${honor.gainType},
            ${honor.v},
            ${honor.rewardExp},
            ${honor.skinType},
            '${honor.shareContent}'
        );`
    logger.info(`[exec sql] ${addSql}`);
    return db.rxQuery(addSql);
}

function queryHonorWithId(honorId) {
    let querySql = `select * from snake.honor where id = ${honorId};`
    logger.info(`[exec sql] ${querySql}`);
    return db.rxQuery(querySql);
}

function queryHonorWithName(name) {
    let querySql = `select * from snake.honor where name = '${name}';`
    logger.info(`[exec sql] ${querySql}`);
    return db.rxQuery(querySql);
}

function listHonors() {
    let querySql = `select name,gameType,gainType,v,rewardExp,skinType,shareContent from snake.honor;`;
    logger.info(`[exec sql] ${querySql}`);
    return db.rxQuery(querySql);
}

function updateHonor(honor) {
    let updateSql = `update snake.honor set `

    let first = true;
    Object.keys(honor).filter(it => honor[it] != undefined).forEach(it => {
        if (it == 'name') return;
        if (!first) {
            updateSql+=',';
        }
        first=false;
        if (typeof honor[it] == 'string') {
            updateSql += `${it}='${honor[it]}'`
        } else {
            updateSql += `${it}=${honor[it]}`
        }
    });
    updateSql += ` where name='${honor.name}';`
    logger.info(`[exec sql] ${updateSql}`);
    // return db.rxQuery(updateSql);
}

module.exports = {
    createTable,
    addHonor,
    queryHonorWithId,
    queryHonorWithName,
    listHonors,
    updateHonor
}
