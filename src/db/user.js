var db = require('./pool.js');

function createUserTable() {
    let userTable = `create table user (
        _id int NOT NULL AUTO_INCREMENT,
        openId  varchar(256) NOT NULL COMMENT 'wechat open id',
        nickName  varchar(256) NOT NULL ,
        honor  varchar(256) NOT NULL COMMENT 'player current honor',
        honorNum  int NOT NULL COMMENT 'gain honor number',
        skin  int NOT NULL COMMENT 'player current skin id',
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
        INDEX (openId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`

    db.con(function (connection) {
        connection.query(userTable, function (err, res) {
            if (err) {
                console.log(`${__filename} ::: create table error : ${err}`);
                return;
            }
            console.log(`${__filename} ::: create table res : ${res}`);
        });
    })
}

module.exports.createUserTable = createUserTable();



