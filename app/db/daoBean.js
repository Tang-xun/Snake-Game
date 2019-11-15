let logger = require('../logger').logger('dao', 'info');

let noExpiredTime = 60 * 1000 * 60 * 24 * 30 * 20;

let experienceTime = 60 * 1000 * 60 * 24 * 5;

function Grade() {
    this.grade;
    this.name;
    this.preExp;
    this.nextExp;
}

function History() {

    this.openId = '';
    this.gameType = 0;
    this.roundRank = -1;
    this.liveTime = 0;
    this.length = 0;
    this.bestKill = 0;
    this.linkKill = 0;
    this.deadTimes = 0;
}

History.prototype = {
    init(params) {
        Object.keys(params)
            .filter(key => params[key] != undefined)
            .forEach(key => {
                this[key] = (typeof (this[key]) == 'number') ? parseInt(params[key]) : params[key];
            });
        logger.info(this);
        return this;
    },


}

function Honor() {
    this.name;
    this.gameType;  //{0:time, 1:endless, 2:any}
    this.gainType;  //{1:winCount, 2:kill, 3:linkKill, 4:length, 5:time, 6:weekWrodRank, 7:weekFriendRank, 8:skinNum}
    this.v;
    this.rewardExp;
    this.skinType;
    this.shareContent;
}

function User() {
    this.openId;
    this.nickName;
    this.headUri;
    this.grade = 0;
    this.gradeName = '小青蛇';
    this.gender = 0;
    this.language = '';
    this.province = '';
    this.city = '';
    this.country = '';
    this.honorNum = 0;
    this.skin = 1;
    this.skinNum = 1;
    this.curExp = 0;
    // 下一升级等级
    this.nextGradeExp = 199;
    this.winCount = 0;
    this.winHonor = 10;
    this.killHonor = 22;
    this.linkKillHonor = 32;
    this.lengthHonor = 41;
    this.timeHonor = 51;
    this.skinHonor = 82;
    this.t_length = 0;
    this.t_bestKill = 0;
    this.t_linkKill = 0;
    this.e_length = 0;
    this.e_bestKill = 0;
    this.e_linkKill = 0;
    this.liveTime = 0;
    this.latestLogin;
}

User.prototype = {
    init(params) {
        Object.keys(params)
            .filter(key => params[key] != undefined)
            .forEach(key => {
                this[key] = (typeof (this[key]) == 'number') ? parseInt(params[key]) : params[key];
            });
        logger.info(this);
        return this;
    },

    updateHistory(history) {
        if (!history.gameType) {
            // time model
            if (history.length > this.t_length) this.t_length = history.length;
            if (history.bestKill > this.t_bestKill) this.t_bestKill = history.bestKill;
            if (history.linkKill > this.t_linkKill) this.t_linkKill = history.linkKill;
            if (history.liveTime > this.liveTime) this.liveTime = history.liveTime;
        } else {
            // endless model
            if (history.length > this.e_length) this.e_length = history.length;
            if (history.bestKill > this.e_bestKill) this.e_bestKill = history.bestKill;
            if (history.linkKill > this.e_linkKill) this.e_linkKill = history.linkKill;
            if (history.liveTime > this.liveTime) this.liveTime = history.liveTime;
        }
    },

    updateHonor(newHonor) {
        Object.keys(newHonor).forEach(key => newHonor[key] != this[key] ? this[key] = newHonor[key] : null);
    }
}

function SkinRecord() {
    this.openId = '';
    this.type = 0;
    this.name = '';
    this.uri = '';
    this.createTime;
    this.updateTime;
    this.expiredTime = '';
    this.expired = false;
}

SkinRecord.prototype = {
    init(params) {
        Object.keys(params)
            .filter(key => params[key] != undefined)
            .forEach(key => {
                this[key] = (typeof (this[key]) == 'number') ? parseInt(params[key]) : params[key];
            });
        logger.info(this);
        return this;
    },

    isExpired() {
        return this.expired;
    },

    updateExpired() {
        let now = new Date().getTime();
        if (this.expiredTime < now) {
            this.expired = true;
        }
    }
}

function Order() {
    this.orderId;
    this.productId;
    this.price;
    this.num;
    this.state; //0 create 1 success 2 fail 3 cancel 4 timeout
    this.openId;
    this.productName;
    this.totalPrice;
    this.createTime;
    this.paymentTime;
}

module.exports = {
    Grade,
    User,
    History,
    SkinRecord,
    Order,
    Honor,
    noExpiredTime,
    experienceTime,
}