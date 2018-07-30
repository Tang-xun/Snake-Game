var db = require('./mysqlPool');
var logger = require('../logger').logger('grade', 'info');

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
    db.con(function (connection) {
        connection.query(createSql, function (err, res) {
            
            if (err) {
                logger.info(`[Event|cretate table] error ${JSON.stringify(err)}`);
                callback(err, null);
            } else {
                logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
                callback(null, res);
            }
        })
    });
}


module.exports = {
    createGradeTable,
}