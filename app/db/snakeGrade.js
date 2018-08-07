var db = require('./mysqlPool');
var logger = require('../logger').logger('grade', 'info');
var RX = require('rxjs');

function createGradeTable (callback) {
    var createSql = `CREATE TABLE IF NOT EXISTS snake.grade  (
        id int NOT NULL AUTO_INCREMENT,
        grade int NOT NULL COMMENT 'user grade',
        name VARCHAR(128) NOT NULL COMMENT 'grade name ',
        preExp int NOT NULL COMMENT 'grade start exp.',
        nextExp int NOT NULL COMMENT 'user grade next exp.',
        PRIMARY KEY (id, grade, name))
        COMMENT = 'user grade config sys';`;
    return db.rxQuery(createSql, null);
}

module.exports = {
    createGradeTable,
}