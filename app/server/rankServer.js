var logger = require('../logger').logger('history', 'info');
var user = require('../db/snakeUser');

var RX = require('rxjs');

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

function sortUserScore() {
    userCountUpdate = false;
    var start = new Date().getTime();
    console.log('sortUserScore start');

    user.getUserCount().flatMap(err => {
        console.info(`error ${err}`);
    }, res => {
        console.log(`${res.count}`)
        userCount = res.count;
        return user.sortUserScore();
    }).flatMap(res=>{
        return rx.Observable.from(res[1]);
    }).

    // rx.Observable.concat(user.getUserCount(), user.sortUserScore()).subscribe(
    //     data => {
    //         console.log(`on next ${JSON.stringify(data)}`);
    //     }, error => {
    //         console.log(`on error ${error}`);
    //     }, () => {
    //         console.log(`on complete `);
    //     })
    /* user.getUserCount().flatMap(
        res => {
            console.log(`user count is ${JSON.stringify(res[1])}`);
            userCount = res[1];
            return user.sortUserScore();
        }
    ).flatMap(res => {
        throw res[0];
        if(res[0]) {
        } else {
            return rx.Observable.from(res[1]);
        }
    }).subscribe(data => {
        console.log(`${JSON.stringify(data)}`);
    }, error => {
        console.log(`on error ${error}`);
    }, () => {
        console.log(`on complete `);
    }) */



    // .subscribe(next=>{
    //     if(next[0]) {
    //         console.log(`sort user score error ${next[0]}`);
    //     } else {
    //         console.log(`sort user score success ${JSON.stringify(next[1])}`);

    //     }
    //     console.log(`speed time ${new Date().getTime() - start} ms`);
    // });
    return;
}

// `select tmp.ranks from(select row_number() over(order by user.score desc) as ranks, user.score, user.openId from snake.user) as tmp where tmp.openId = 1532964784280;`

sortUserScore();

