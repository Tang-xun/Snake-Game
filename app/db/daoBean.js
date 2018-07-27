var Grade = function () {
    grade;
    name;
    preExp;
    nextExp;
}

var History = function () {
    openid;
    game_model = 0;
    game_score = 0;
    length = 0;
    bestKill = 0;
    linkKill = 0;
}


var User = function () {
    this.openid;
    this.nickName;
    this.headUri;
    this.honor = '小青蛇';
    this.honorNum = 0;
    this.skin = 1;
    this.skinNum = 1;
    this.curExp = 0;
    // 下一升级等级
    this.nextGradeExp = 500;
    this.t_bestLen = 0;
    this.t_mostKill = 0;
    this.t_linkKill = 0;
    this.e_bestLen = 0;
    this.e_mostKill = 0;
    this.e_linkKill = 0;
    this.latestLogin;
    this.updateTime;
    this.createTime;
}


module.exports = {
    Grade,
    User,
    History,
}