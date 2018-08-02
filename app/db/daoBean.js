var Grade = function () {
    this.grade;
    this.name;
    this.preExp;
    this.nextExp;
}

var History = function () {
    this.openId;
    this.gameType = 0;
    this.exp = 0;
    this.length = 0;
    this.bestKill = 0;
    this.linkKill = 0;
}

var User = function () {
    this.openId;
    this.nickName;
    this.headUri;
    this.grade = 0,
    this.honor = '小青蛇';
    this.honorNum = 0;
    this.skin = 1;
    this.skinNum = 1;
    this.curExp = 0;
    // 下一升级等级
    this.nextGradeExp = 500;
    this.t_length = 0;
    this.t_bestKill = 0;
    this.t_linkKill = 0;
    this.e_length = 0;
    this.e_bestKill = 0;
    this.e_linkKill = 0;
    this.latestLogin;
    this.updateTime;
    this.createTime;
}

var Order = function() {
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
    Order,
}