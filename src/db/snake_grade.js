var db = require('./comonPool');
var config = require('../config');

var grade = function () {
    this.grade;
    this.name;
    this.preExp;
    this.nextExp;
}

function createGradeTable(callback) {
    var createSql = `CREATE TABLE IF NOT EXISTS snake.grade  (
        id INT NOT NULL AUTO_INCREMENT,
        grade INT NOT NULL COMMENT 'user grade',
        name VARCHAR(128) NOT NULL COMMENT 'grade name ',
        preExp INT NOT NULL COMMENT 'grade start exp.',
        nextExp INT NOT NULL COMMENT 'user grade next exp.',
        PRIMARY KEY (id, grade, name))
        COMMENT = 'user grade config sys';
      `
    db.con(function (connection) {
        connection.query(createSql, function (err, res) {
            if (err) {
                console.error(`${config.now()} [Event | cretate grade table] error ${err}`);
                callback(err, null);
            } else {
                console.info(`${config.now()} [Event | create grade table] ok ${res}`);
                callback(null, res);
            }
        })
    });

}

function toString() {
    console.log(`${config.now()}  grade toString called ...`);
    return 'call succss';
}

module.exports = {
    grade,
    createGradeTable,
    toString,
}