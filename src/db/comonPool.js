var mysql = require('mysql');
var log4js = require('../../logger');

var logger = log4js.logger('db pool ', 'info');
// root tx147258
var pool = mysql.createPool({
    host:'localhost',
    user:'snake_game',
    password:'snake',
    database:'snake',
    port:3306,
});

var db = {};

db.con = function(callback) {
    pool.getConnection(function (err, connection) {
        logger.info(`[event | connect start] ::: db connection start ... `);

        if(err) {
            throw err;
        } else{
            callback(connection);
        }
        connection.release;
        
        logger.info(`[event | connect end] ::: connection end ...`);
    });
}

module.exports = db;

