var RX = require('rxjs');
var mysql = require('mysql');
var logger = require('../../app/logger').logger('db-pool', 'info');


var pool = mysql.createPool({
    host: 'localhost',
    user: 'snake_game',
    password: 'snake',
    database: 'snake',
    port: 3306,
});

var db = {};

db.con = function (callback) {

    pool.getConnection(function (err, connection) {
        if (err) {
            logger.info(`[event|dbconnection error ${JSON.stringify(err)} ...`);
            connection.release();
            throw err;
        } else {
            callback(connection);
        }
        connection.release();
    });
}

db.query = function (sql, options, callback) {
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

module.exports = db;