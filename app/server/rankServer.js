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
        console.log(`next params count is ${next.length}`);
        console.log(`user count  next ${JSON.stringify(next[1])}`);
    });
    user.sortUserScore().subscribe(res => {
        if (res == null || res.length == 0) {
            console.log('not user need for ranks');
        }
        var i = 0;
        var updateRanksSql = `update snake.user set `;
        updateRanksSql += 
        res[1].forEach(element => {
            console.log(`${element.ranks} \t ${element.openId} \t ${element.score}`);
        });
    })
    console.timeEnd('sort_score');
    return;
}

// `select tmp.ranks from(select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user) as tmp where tmp.openId = 1532964784280;`

sortUserScore();

