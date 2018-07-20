var mysql = require('mysql');
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
        console.log(`${__filename} ::: db connection start ... `);

        if(err) {
            throw err;
        } else{
            callback(connection);
        }
        connection.release;
        
        console.log(`${__filename} ::: connection end ...`);
    });
}

module.exports = db;

