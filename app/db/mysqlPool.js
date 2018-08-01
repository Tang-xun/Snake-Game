var RX = require('rxjs');
var mysql = require('mysql');
var logger = require('../../app/logger').logger('db', 'info');


var pool = mysql.createPool({
    host: 'localhost',
    user: 'snake_game',
    password: 'snake',
    database: 'snake',
    port: 3306,
    connectionLimit: 20,
    trace:true,
});

var query = function (sql, options, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.info(`[event|dbconnection] error ${JSON.stringify(err)} ...`);
            throw err;
        } else {
            connection.query(sql, options,function(err, res) {
                connection.release();
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res);
                }
            })
        }
    });
}

module.exports = {
    query,
};