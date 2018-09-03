let user = require('../db/snakeUser');

let history = require('../db/snakeHistory');

let logger = require('../logger').logger('user-manager', 'info');

function compareChanage(userBean, changeBean) {
    logger.info(userBean);
    logger.info(changeBean);
    let keys = Object.keys(changeBean);
    let usefulKeys = keys.filter(key => changeBean[key] != undefined);
    usefulKeys.forEach(key => {
        userBean[key] = changeBean[key];
    });
}

function updateUserHonor(userBean, honorBean) {
    logger.info(`updateUserHonor ${userBean} ${honorBean}`);
    compareChanage(userBean, changeBean);
}

function updateUserHistroy(userBean, historyBean) {
    logger.info(`updateUserHonor ${userBean} ${historyBean}`);
    // time model
    if (!historyBean.gameType) {
        // time model
        if (historyBean.length > userBean.t_length) userBean.t_length = historyBean.length;
        if (historyBean.bestKill > userBean.t_bestKill) userBean.t_bestKill = historyBean.bestKill;
        if (historyBean.linkKill > userBean.t_linkKill) userBean.t_linkKill = historyBean.linkKill;
        if (historyBean.liveTime > userBean.liveTime) userBean.liveTime = historyBean.liveTime;
    } else {
        // endless model
        if (historyBean.length > userBean.e_length) userBean.e_length = historyBean.length;
        if (historyBean.bestKill > userBean.e_bestKill) userBean.e_bestKill = historyBean.bestKill;
        if (historyBean.linkKill > userBean.e_linkKill) userBean.e_linkKill = historyBean.linkKill;
        if (historyBean.liveTime > userBean.liveTime) userBean.liveTime = historyBean.liveTime;
    }
}

let initNickNames = ["乐咔影像传媒清泉", "路西", "端午🍃", "期待双女主版的《消失的爱人》", "搞", "『狷者杼芫』", "Daisy", "梦里想想", "Qiqi", "小辣鸡丁🌀", "思啊斯", "Jesse", "哇咔咔", "ThRi", "Lucas", "夏天不要吃零食，", "不像驴不像佛", "WIF", "_Fan''范", "北风🎴", "于宝江", "左仑", "Luna", "爱昕觉罗", "ps装好我的速效救心丸", "Rachel", "冷月花魂", "匪鉴", "晚来天欲雪", "等到鱼叔🐠 更新了再睡  安稳", "蒋小玮", "Jorge_Cheng", "Mlight🌵", "小澈", "王小胖长成圆总了🙃", "清晨不等黄昏", "李好", "财源长济", "华枝春满", "yellow.淑hui", "晓筱", "想想", "spás bán🍁", "李庆", "🍕林育焙READY", "吉吉(o´ω`o)", "请喊我蛮大人", "我就是好萌好萌的我啊", "球～", "GeMa-Huang", "歌歌", "JY.S", "于qqqqqqq", "明月缺", "大头( ･᷄ὢ･᷅ )", "大段", "龘鎠", "璇zhi~", "帅帅酱-Peter", "L ily", "这 该有多好", "GUANGYE", "哇哦哇哦", "回忆的片刻。", "拾柒.", "黑夜影", "fresh", "五一粑粑考研顺利撸起袖子加油干", "K_Phz", "Juice", "lulululu", "lily", "白夜", "红尘炼身心", "丶Ethan", "柚子你个柠檬", "晓东", "Cindy", "山今", "零落🌸夏花", "女王°", "咖喱牛腩", "一骑红尘飞", "温州KFC", "没创意的噜爸", "🔎Copper.Hsiao🍳", "王小啸", "sweet tea", "今天", "Fearless_", "Glaukopis", "张宇宙"];

let realNickNames = [];

function getPlayNickName() {
    if (global.userCount < 100) {
        let max = (initNickNames.length - 50);
        let start = Math.floor(Math.random() * max);
        return initNickNames.slice(start, start + 50);
    } else {
        let max = (realNickNames.length - 50);
        let start = Math.floor(Math.random() * max);
        return realNickNames.splice(start, start + 50);
    }
}

module.exports = {
    updateUserHonor,
    updateUserHistroy,
    getPlayNickName,
}

