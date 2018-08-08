function Grade () {
    this.grade;
    this.name;
    this.preExp;
    this.nextExp;
}

function History () {
    this.openId;
    this.gameType = 0;
    this.score = 0;
    this.length = 0;
    this.bestKill = 0;
    this.linkKill = 0;
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

function User () {
    this.openId;
    this.nickName;
    this.headUri;
    this.grade = 0;
    this.gender=0;
    this.language='';
    this.province='';
    this.city='';
    this.country='';
    this.honor = '小青蛇';
    this.score = 0;
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
    Order,
    Honor,
}