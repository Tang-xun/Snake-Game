var logger = require('../logger').logger('history', 'info');
var user = require('../db/snakeUser');

var RX = require('rxjs');

// 用户数
let userCount = 0;
// 所有的分数
let userScore = {};
// 每个分数段上限
let perScore = [];
// 分段个数
const splitCount = 10;

function sortUserScore() {

    console.time('sort_score');
    console.info('sortUserScore start')
    user.getUserCount().subscribe(next => {
        console.log(`user count  next ${JSON.stringify(next)}`);
    }, error => {
        console.log(`user count  error ${JSON.stringify(error)}`);
    });
    user.sortUserScore().subscribe(next => {
        console.log(`user sort next ${JSON.stringify(next)}`);
    }, error => {
        console.log(`user sort error ${JSON.stringify(error)}`);
    });
    console.timeEnd('sort_score');
    return;
}

// `select tmp.ranks from(select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user) as tmp where tmp.openId = 1532964784280;`

sortUserScore();

