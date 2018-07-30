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
    RX.Observable.create(observer => {
        RX.bindCallback(user.getUserCount)().subscribe(err => {
            observer.error(err);
        }, res => {
            observer.next(res)
        })
        RX.bindCallback(user.sortUserScore)().subscribe(err => {
            observer.error(err);
        }, res => {
            observer.next(res)
        });
        // observer.complete();
    }).subscribe(
        function next(res){
            console.info(`sub next ${res}`);
        },
        function error(err) {
            console.info(`sub error ${error}`);
        },
        function complete(){
            console.info('sub complete')
        },
    )
    /* RX.bindCallback(user.getUserCount)().subscribe(
        err => {
            logger.error(`query user count error ${err}`);
        },
        res => {
            this.userCount = res;
            logger.info(`query user count ok ${res}`);
        }
    );

    RX.bindCallback(user.sortUserScore)().subscribe(
        err => {
            logger.error(`sort user socre error ${err}`);
        },
        res => {
            this.userScore = res;
            logger.info(`sort user socre ok ${res}`);
        }
    ); */
    console.timeEnd('sort_score');
    return;
}

sortUserScore();


/* function updateUserCount() {
    user.getUserCount(function (err, res) {
        if (err) {
            logger.error(`query user count error ${err}`);
        } else {
            this.userCount = res;
        }
    })
} */

