const RX = require('rx');
const mysql = require('mysql');
const logger = require('../logger').logger('db', 'info');

let pool = mysql.createPool({
    host: 'localhost',
    user: 'snake_game',
    password: 'snake',
    database: 'snake',
    port: 3306,
    connectionLimit: 50,
    trace: true,
});

function rxQuery (sql, options) {
    return RX.Observable.create(observer => {
        pool.getConnection((err, connection) => {
            if (err) {
                logger.info(`connect error ${JSON.stringify(err)}`);
                observer.error(err);
                return;
            }
            connection.query(sql, options, (err, res) => {
                connection.release();
                if (err) {
                    logger.info(`query error ${JSON.stringify(err)}`);
                    observer.error(err);
                } else {
                    observer.next(res);
                }
                observer.onCompleted();
            });
        });
    });
}

module.exports = {
    rxQuery,
};