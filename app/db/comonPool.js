var mysql = require('mysql');

var logger = require('../../app/logger').logger('db-pool', 'info');
var Rx = require('rxjs');

// root tx147258
var pool = mysql.createPool({
    host:'localhost',
    user:'snake_game',
    password:'snake',
    database:'snake',
    port:3306,
});

db.con = function(callback) {
    pool.getConnection(function (err, connection) {
        if(err) {
            logger.info(`[event|db] ::: connection error ${JSON.stringify(err)} ...`);
            throw err;
        } else{
            callback(connection);
        }
        connection.release;
    });
}

module.exports = db;

