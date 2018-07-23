var config = require('../config');
var db = require('./comonPool');

// data bean
var User = function () {

    this.openid = {
        set() {

        },
        get() {
            
        }
    };
    this.nickName;
    this.honor = '小青蛇';
    this.honorNum = 0;
    this.skin = 1;
    this.curExp = 0;
    // 下一升级等级
    this.nextGradeExp = 500;
    this.t_bestLen = 0;
    this.t_mostKill = 0;
    this.t_linkKill = 0;

    this.e_bestLen = 0;
    this.e_mostKill = 0;
    this.e_linkKill = 0;

    this.latestLogin;
    this.updateTime;
    this.createTime;

    console.log(`init User ::: ${openid}`);
    
}

/**
 * create user table , when app first start 
 * @param {callback} callback 
 */
function createUserTable(callback) {
    console.log(`[event | create user table] start`);
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
        INDEX (openId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`

    db.con(function (connection) {
        connection.query(userTable, function (err, res) {
            if (err) {
                console.error(`[Event | user create table] ::: error : ${err}`);
                callback(err, null);
            } else {
                console.log(`[Event | user create table] ::: ok : ${res}`);
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
function insertUserInfo(openid, nickName, callback) {
    console.log(`insert User info ...`);
    var user = new User();
    user.openid = openid;
    user.nickName = nickName;

    user.honor = 1;
    user.honorNum = 1;
    user.skin = 1;
    user.skinNum = 1;
    user.curExp = 0;
    user.nextGradeExp = 500;

    user.t_bestLen = 0;
    user.t_mostKill = 0;
    user.t_linkKill = 0;

    user.e_bestLen = 0;
    user.e_mostKill = 0;
    user.e_linkKill = 0;

    let insertUser = `insert into snake.user 
        (openID, nickName, honor, honorNum, skin, curExp, nextGradeExp, latestLogin) 
        values(
            ${user.openid}, 
            ${user.nickName}, 
            ${user.honor}, 
            ${user.honorNum}, 
            ${user.skin}, 
            ${user.skinNum}, 
            ${user.curExp}, 
            ${user.nextGradeExp},
            CURRENT_TIMESPTAME,
        );`

    db.con(function (connection) {
        connection.query(insertUser, function (err, res) {
            if (err) {
                console.error(`[Event | user insert] error ::: ${err}`);
                callback(err, null);

            } else {
                console.log(`[Event | user insert] ok ::: ${res}`);
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
function queryUserInfo(openid, callback) {
    let queryUser = `select * from snake.user where openid=${openid};`;
    db.con(function (connection) {
        connection.query(queryUser, function (err, res) {
            if (err) {
                console.error(`[Event| user query] ${openid} error ::: ${err}`);
                callback(err, null);
            } else {
                console.log(`[Event| user query] ${openid} ok ::: ${res}`);
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
function updateLoginTime(openid, callback) {
    let updateLoginTime = `update snake.user set updateTime=CURRENT_TIMESTAMP where openid=${openid};`;

    db.con(function (connection) {
        connection.query(updateLoginTime, function (err, res) {
            if (err) {
                console.log(`[Event | sign ] error ${err}`);
                callback(err, null);
            } else {
                console.log(`[Event | sign ] OK ${res}`);
                callback(null, res);
            }
        });
    })
}

function toString() {
    console.log(`${config.now()}  user toString called ...`);
    return 'call succss';
}

module.exports = {
    User,
    createUserTable,
    insertUserInfo,
    queryUserInfo,
    updateLoginTime,
    toString,
}