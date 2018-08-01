var db = require('./mysqlPool');
var logger = require('../logger').logger('grade', 'info');
var RX = require('rxjs');

var createGradeTable = function (callback) {
    var createSql = `CREATE TABLE IF NOT EXISTS snake.grade  (
        id INT NOT NULL AUTO_INCREMENT,
        grade INT NOT NULL COMMENT 'user grade',
        name VARCHAR(128) NOT NULL COMMENT 'grade name ',
        preExp INT NOT NULL COMMENT 'grade start exp.',
        nextExp INT NOT NULL COMMENT 'user grade next exp.',
        PRIMARY KEY (id, grade, name))
        COMMENT = 'user grade config sys';
      `;
    return RX.bindCallback(db.query)(createSql);
}


module.exports = {
    createGradeTable,
}