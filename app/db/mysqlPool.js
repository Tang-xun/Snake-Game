var RX = require('rx');
var mysql = require('mysql');
var logger = require('../../app/logger').logger('db', 'info');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'snake_game',
    password: 'snake',
    database: 'snake',
    port: 3306,
    connectionLimit: 50,
    trace: true,
});

var rxQuery = function (sql, options) {
    return RX.Observable.create(observer => {
        pool.getConnection((err, connection) => {
            connection.query(sql,options, (err, res) => {
                connection.release();
                if (err) {
                    logger.info(`${JSON.stringify(err)}`);
                    observer.error(err);
                } else {
                    logger.info(`${JSON.stringify(res)}`);
                    observer.next(res);
                }
            });
        });
    });
}

module.exports = {
    rxQuery,
};