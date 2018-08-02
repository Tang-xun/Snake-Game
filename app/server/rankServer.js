var logger = require('../logger').logger('history', 'info');
var user = require('../db/snakeUser');
var mysql = require('mysql');

var rx = require('rx');

// 用户数
let userCount = 0;
// 所有的分数
let userScore = {};
// 每个分数段上限
let perScore = [];
// 分段个数
const splitCount = 10;

let userCountUpdate = false;

var pool = mysql.createPool({
    host: 'localhost',
    user: 'snake_game',
    password: 'snake',
    database: 'snake',
    port: 3306,
    connectionLimit: 50,
    trace: true,
});

function sortUserScore() {
    user.getUserCount().subscribe(next => {
        console.log(`next ${next}`);
    }, error => {
        console.log(`error ${error}`);
    }, complete => {
        console.log(`complete `);
    });
}


function rxSortScore() {
    rx.Observable.create(observer => {
        pool.getConnection((err, connection) => {
            connection.query('select count(openId) as count from snake.user;', null, (err, res) => {
                connection.release();
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    observer.error(err);
                } else {
                    console.log(`${JSON.stringify(res)}`);
                    observer.next(res);
                }
            });
        });
    }).subscribe(next => {
        console.log(`next ${JSON.stringify(next)}`);
    }, error => {
        console.log(`error ${JSON.stringify(error)}`);

    }, complete => {
        console.log(`complete`);
    });
}
// `select tmp.ranks from(select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user) as tmp where tmp.openId = 1532964784280;`
sortUserScore();
// rxSortScore();