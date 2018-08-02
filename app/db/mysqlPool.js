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

    console.log(`${typeof(RX.Observable.fromCallback(pool.getConnection)())}`);

    // RX.Observable.fromCallback(pool.getConnection)().flatMap(
    //     err => {
    //         console.info(`${JSON.stringify(err)}`);
    //     }, connection => {
    //         return RX.Observable.
    //             fromCallback(connection.query)(sql, options)
    //             .doOnCompleted(() => {
    //                 connection.release();
    //             }
    //             ).doOnError(() => {
    //                 connection.release();
    //             });
    //     }
    // );
}

var query = function (sql, options, callback) {




    pool.getConnection(function (err, connection) {
        if (err) {
            logger.info(`[event|dbconnection] error ${JSON.stringify(err)} ...`);
            throw err;
        } else {
            connection.query(sql, options, function (err, res) {
                connection.release();
                if (err) {
                    throw err;
                } else {
                    callback(res);
                }
            })
        }
    });
}

module.exports = {
    query,
    rxQuery,
};