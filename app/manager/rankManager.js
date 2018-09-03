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
    }).subscribe(next=>{
        logger.info(`[time task] rxFetchUserNickName next ${JSON.stringify(next)}`);
        realNickNames = next;
    }, error=>{
        logger.info(error);
    })
}

let initNickNames = ["乐咔影像传媒清泉", "路西", "端午🍃", "期待双女主版的《消失的爱人》", "搞", "『狷者杼芫』", "Daisy", "梦里想想", "Qiqi", "小辣鸡丁🌀", "思啊斯", "Jesse", "哇咔咔", "ThRi", "Lucas", "夏天不要吃零食，", "不像驴不像佛", "WIF", "_Fan''范", "北风🎴", "于宝江", "左仑", "Luna", "爱昕觉罗", "ps装好我的速效救心丸", "Rachel", "冷月花魂", "匪鉴", "晚来天欲雪", "等到鱼叔🐠 更新了再睡  安稳", "蒋小玮", "Jorge_Cheng", "Mlight🌵", "小澈", "王小胖长成圆总了🙃", "清晨不等黄昏", "李好", "财源长济", "华枝春满", "yellow.淑hui", "晓筱", "想想", "spás bán🍁", "李庆", "🍕林育焙READY", "吉吉(o´ω`o)", "请喊我蛮大人", "我就是好萌好萌的我啊", "球～", "GeMa-Huang", "歌歌", "JY.S", "于qqqqqqq", "明月缺", "大头( ･᷄ὢ･᷅ )", "大段", "龘鎠", "璇zhi~", "帅帅酱-Peter", "L ily", "这 该有多好", "GUANGYE", "哇哦哇哦", "回忆的片刻。", "拾柒.", "黑夜影", "fresh", "五一粑粑考研顺利撸起袖子加油干", "K_Phz", "Juice", "lulululu", "lily", "白夜", "红尘炼身心", "丶Ethan", "柚子你个柠檬", "晓东", "Cindy", "山今", "零落🌸夏花", "女王°", "咖喱牛腩", "一骑红尘飞", "温州KFC", "没创意的噜爸", "🔎Copper.Hsiao🍳", "王小啸", "sweet tea", "今天", "Fearless_", "Glaukopis", "张宇宙"];

let realNickNames = [];

function getPlayNickName() {
    if (global.userCount < 100 || realNickNames.length < NICK_NAME_COUNT_MAX) {
        let max = (initNickNames.length - NICK_NAME_COUNT_MAX);
        let start = Math.floor(Math.random() * max);
        return initNickNames.slice(start, start + NICK_NAME_COUNT_MAX);
    } else {
        let max = (realNickNames.length - NICK_NAME_COUNT_MAX);
        let start = Math.floor(Math.random() * max);
        return realNickNames.splice(start, start + NICK_NAME_COUNT_MAX);
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