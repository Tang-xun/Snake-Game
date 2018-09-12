const rx = require('rx');

const logger = require('../logger').logger('ranks', 'info');
const user = require('../db/snakeUser');

let minutesUint = 60000

let shortDelay = 2000;
let shortUpdateDuration = process.env == 'dev' ? minutesUint * 5 : minutesUint * 30;

let longDelay = shortDelay * 2;
let longUpdateDuration = shortUpdateDuration * 2;

let rankExp = [];

let NICK_NAME_COUNT_MAX = 50;
function sysConfig() {
    this.userCount = 0;
    this.payCount = 0;
}

let ServerConfig = new sysConfig();

/**
 * fetch user count timeTask
 */
function rxFetchUserCount() {
    logger.info(`shortDelay: ${shortDelay} shortUpdateDuration:${shortUpdateDuration}`);
    rx.Observable.timer(shortDelay, shortUpdateDuration).flatMap(() => {
        logger.info(`[time task] rxFetchUserCount :::`);
        return user.getUserCount();
    }).subscribe(data => {
        logger.info(`[time task] fetch user count next ${JSON.stringify(data)}`);
        global.userCount = data;
        ServerConfig.userCount = data;
    }, error => {
        logger.error(`[time task] fetch user count error ${error}`);
    })
}

/**
 *  rank user score timeTask
 */
function rxRanksTimeTask() {
    rx.Observable.timer(longDelay, longUpdateDuration).flatMap(() => {
        logger.info('[time task] rxRanksTimeTask ::: ');
        return user.sortUserExp();
    }).subscribe(next => {
        logger.info(`[time task] next update userRanks message: ${next.message}`);
    }, error => {
        logger.info(`[time task] error sort user score ${error}`);
    });
}

function rxFetchRankScore() {
    rx.Observable.timer(shortDelay + 1000, shortUpdateDuration).flatMap(() => {
        logger.info('[time task] rxFetchRankScore :::');
        if (isNaN(global.userCount)) {
            logger.info(`user count is NaN needn't fetch Rank ${ServerConfig.userCount} ${global.userCount}`);
            throw { error: 'user count is NaN' };
        }
        let groupCount = Math.round(global.userCount / 20);
        logger.info(`[time task] current user score group count ${groupCount}`);
        return user.fetchRankExp(groupCount > 0 ? groupCount : 1);
    }).subscribe(next => {
        logger.info(`[time task] rxFetchRankScore next ${JSON.stringify(next)}`);
        rankExp = next;
    }, error => {
        logger.info(`[time task] error fetch rank score ${error}`);
    })
}

function calUserRanks(curExp) {
    logger.info(`calUserRanks start ${curExp}`);
    return rx.Observable.from(rankExp)
        .first(it => it.curExp <= curExp)
        .map(it => Math.floor(it.ranks / (rankExp.length) * 100))
        .catch(error => {
            if (error.name = 'EmptyError') {
                if (global.userCount == 0) {
                    return rx.Observable.just(100);
                } else {
                    return rx.Observable.just(Math.round(100 / global.userCount));
                }
            }
        });
}

function calUserRanksSync(curExp) {
    logger.info('calUser Ranks start ' + curExp);

    let rankBeans = rankExp.filter(it => it.curExp >= curExp);

    if (rankBeans.length == 0) return 5;
    if (rankBeans.length == curExp.length) return 100;

    return Math.floor((rankBeans.length / global.userCount) * 100);
}

function rxFetchUserNickNames() {
    rx.Observable.timer(shortDelay + 1000, shortUpdateDuration).flatMap(() => {
        logger.info(`[time task] rxFetchUserNickName ::: `);
        let userCount = global.userCount;

        if (userCount > 100) {
            let count = Math.floor(userCount / 100);
            return user.selectNickName(count);
        }
        logger.info(`user count < 100`);
        return rx.Observable.just([]);
    }).subscribe(next => {
        logger.info(`[time task] rxFetchUserNickName next ${JSON.stringify(next)}`);
        realNickNames = next;
    }, error => {
        logger.info(error);
    })
}

let initNickNames = [{ "name": "乐咔影像传媒清泉", "url": "" },
{ "name": "路西", "url": "" },
{ "name": "端午🍃", "url": "" },
{ "name": "期待双女主版的《消失的爱人》", "url": "" },
{ "name": "搞", "url": "" },
{ "name": "『狷者杼芫』", "url": "" },
{ "name": "Daisy", "url": "" },
{ "name": "梦里想想", "url": "" },
{ "name": "Qiqi", "url": "" },
{ "name": "小辣鸡丁🌀", "url": "" },
{ "name": "思啊斯", "url": "" },
{ "name": "Jesse", "url": "" },
{ "name": "哇咔咔", "url": "" },
{ "name": "ThRi", "url": "" },
{ "name": "Lucas", "url": "" },
{ "name": "夏天不要吃零食，", "url": "" },
{ "name": "不像驴不像佛", "url": "" },
{ "name": "WIF", "url": "" },
{ "name": "_Fan''范", "url": "" },
{ "name": "北风🎴", "url": "" },
{ "name": "于宝江", "url": "" },
{ "name": "左仑", "url": "" },
{ "name": "Luna", "url": "" },
{ "name": "爱昕觉罗", "url": "" },
{ "name": "ps装好我的速效救心丸", "url": "" },
{ "name": "Rachel", "url": "" },
{ "name": "冷月花魂", "url": "" },
{ "name": "匪鉴", "url": "" },
{ "name": "晚来天欲雪", "url": "" },
{ "name": "等到鱼叔🐠 更新了再睡  安稳", "url": "" },
{ "name": "蒋小玮", "url": "" },
{ "name": "Jorge_Cheng", "url": "" },
{ "name": "Mlight🌵", "url": "" },
{ "name": "小澈", "url": "" },
{ "name": "王小胖长成圆总了🙃", "url": "" },
{ "name": "清晨不等黄昏", "url": "" },
{ "name": "李好", "url": "" },
{ "name": "财源长济", "url": "" },
{ "name": "华枝春满", "url": "" },
{ "name": "yellow.淑hui", "url": "" },
{ "name": "晓筱", "url": "" },
{ "name": "想想", "url": "" },
{ "name": "spás bán🍁", "url": "" },
{ "name": "李庆", "url": "" },
{ "name": "🍕林育焙READY", "url": "" },
{ "name": "吉吉(o´ω`o)", "url": "" },
{ "name": "请喊我蛮大人", "url": "" },
{ "name": "我就是好萌好萌的我啊", "url": "" },
{ "name": "球～", "url": "" },
{ "name": "GeMa-Huang", "url": "" },
{ "name": "歌歌", "url": "" },
{ "name": "JY.S", "url": "" },
{ "name": "于qqqqqqq", "url": "" },
{ "name": "明月缺", "url": "" },
{ "name": "大头( ･᷄ὢ･᷅ )", "url": "" },
{ "name": "大段", "url": "" },
{ "name": "龘鎠", "url": "" },
{ "name": "璇zhi~", "url": "" },
{ "name": "帅帅酱-Peter", "url": "" },
{ "name": "L ily", "url": "" },
{ "name": "这 该有多好", "url": "" },
{ "name": "GUANGYE", "url": "" },
{ "name": "哇哦哇哦", "url": "" },
{ "name": "回忆的片刻。", "url": "" },
{ "name": "拾柒.", "url": "" },
{ "name": "黑夜影", "url": "" },
{ "name": "fresh", "url": "" },
{ "name": "五一粑粑考研顺利撸起袖子加油干", "url": "" },
{ "name": "K_Phz", "url": "" },
{ "name": "Juice", "url": "" },
{ "name": "lulululu", "url": "" },
{ "name": "lily", "url": "" },
{ "name": "白夜", "url": "" },
{ "name": "红尘炼身心", "url": "" },
{ "name": "丶Ethan", "url": "" },
{ "name": "柚子你个柠檬", "url": "" },
{ "name": "晓东", "url": "" },
{ "name": "Cindy", "url": "" },
{ "name": "山今", "url": "" },
{ "name": "零落🌸夏花", "url": "" },
{ "name": "女王°", "url": "" },
{ "name": "咖喱牛腩", "url": "" },
{ "name": "一骑红尘飞", "url": "" },
{ "name": "温州KFC", "url": "" },
{ "name": "没创意的噜爸", "url": "" },
{ "name": "🔎Copper.Hsiao🍳", "url": "" },
{ "name": "王小啸", "url": "" },
{ "name": "sweet tea", "url": "" },
{ "name": "今天", "url": "" },
{ "name": "Fearless_", "url": "" },
{ "name": "Glaukopis", "url": "" },
{ "name": "张宇宙", "url": "" }];

let realNickNames = [];

function getPlayNickName() {
    if (global.userCount < 100 || realNickNames.length < NICK_NAME_COUNT_MAX) {
        let max = (initNickNames.length - NICK_NAME_COUNT_MAX);
        let start = Math.floor(Math.random() * max);
        return initNickNames.slice(start, start + NICK_NAME_COUNT_MAX);
    } else {
        let max = (realNickNames.length - NICK_NAME_COUNT_MAX);
        let start = Math.floor(Math.random() * max);
        return realNickNames.slice(start, start + NICK_NAME_COUNT_MAX);
    }
}

module.exports = {
    ServerConfig,
    calUserRanks,
    calUserRanksSync,
    rxFetchUserCount,
    rxFetchRankScore,
    rxRanksTimeTask,
    getPlayNickName,
    rxFetchUserNickNames,
}