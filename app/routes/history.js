const express = require('express');
const dao = require('../db/daoBean');
const user = require('../db/snakeUser');
const utils = require('../util/comUtils');
const history = require('../db/snakeHistory');
const rankManager = require('../manager/rankManager');
const gradeManager = require('../manager/gradeManager');
const honorManager = require('../manager/honorManager');
const honorRecords = require('../db/snakeHonorRecords');
const skinManager = require('../manager/skinManager');

const logger = require('../logger').logger('route', 'info');
const rx = require('rx');

let router = express.Router();

history.createHistoryTable().subscribe(next => {
    logger.info(`[create history] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create history] error ${JSON.stringify(error)}`);
});

function query(req, res, next) {
    let openId = req.body.openId;
    let limit = req.body.limit;
    logger.info(`history query ${openId} ${limit}`);
    history.queryHistory(openId, limit).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 600, 'error', error);
    });
}

function checkParams(history) {
    let checked = (history == null ||
        history.openId.trim().length == 0 ||
        history.gameType == null ||
        isNaN(history.roundRank) ||
        isNaN(history.length) ||
        isNaN(history.bestKill) ||
        isNaN(history.liveTime) ||
        isNaN(history.deadTimes) ||
        isNaN(history.linkKill));
    return checked;
}

/**
 * @description
 * 1 查询user info 
 * 2 匹配user 最高纪录， 并更新userInfo
 * 3 匹配Honor 判断勋章逻辑，并更新userInfo
 * 4 计算curExp 判断等级逻辑和经验，皮肤奖励
 * 5 计算honor 判断皮肤，奖金逻辑
 * 6 同步(更新user, 添加history, 添加honor, 添加skin奖励)
 * 7 返回最新用户信息，世界排名，honor信息，皮肤奖励和经验奖励
 */
function addHistoryLogic(req, res, next) {

    let historyBean = new dao.History().init(req.body);

    if (checkParams(historyBean)) {
        utils.writeHttpResponse(res, 601, 'params checked error', historyBean);
        return;
    }

    logger.info('add history ' + historyBean);

    user.queryUserInfo(historyBean.openId).flatMap(it => {
        // 用户数据
        let userBean = new dao.User().init(it);
        logger.info('query user info ');
        logger.info(userBean);
        // 更新用户的个人记录
        userBean.updateHistory(historyBean);
        if (historyBean.roundRank == 1) userBean.winCount++;
        historyBean.winCount = userBean.winCount;
        historyBean.skinNum = userBean.skinNum;
        let newHonor = honorManager.fetchHonorSync(historyBean);

        // 用户勋章记录
        let honorBean = {
            winHonor: userBean.winHonor,
            lengthHonor: userBean.lengthHonor,
            killHonor: userBean.killHonor,
            linkKillHonor: userBean.linkKillHonor,
            timeHonor: userBean.timeHonor,
            skinHonor: userBean.skinHonor,
        }

        let honors = [];
        let newGainHonor = utils.findDiffProperty(newHonor, honorBean)

        logger.info('update honor before ' + JSON.stringify(userBean));
        userBean.updateHonor(newHonor);
        logger.info('update honor after ' + JSON.stringify(userBean));
        ;
        logger.info('new gain honor: ' + JSON.stringify(newGainHonor));
        Object.values(newGainHonor).forEach(v => honors.push(honorManager.fetchHonorWithCode(v)));
        logger.info('honors: ' + JSON.stringify(honors));

        // 计算经验所需的数据
        let honorExp = 0;
        let honorSkins = [];
        honors.forEach(it => {
            logger.info('forEach honor ' + JSON.stringify(it));
            it.openId = userBean.openId;
            if (it.rewardExp > 0) honorExp += it.rewardExp;
            if (it.skinType > 0) honorSkins.push(gradeManager.skinType[it.skinType]);
        });

        let historyExp = gradeManager.calculExp(historyBean);
        logger.info('historyExp: ' + historyExp);
        userBean.curExp += historyExp;
        userBean.curExp += honorExp;

        let gradeInfo = gradeManager.calculGrade(userBean.curExp);
        logger.info('gradeInfo' + JSON.stringify(gradeInfo));
        userBean.curExp += gradeInfo.rewrd.rdExp ? gradeInfo.rewrd.rdExp : 0;
        logger.info('gradeInfo.rewrd.rdSkin :::: ');
        logger.info(honorSkins);
        logger.info(gradeInfo.rewrd.rdSkin);

        logger.info(gradeInfo.rewrd.rdSkin ? "true" : "false");

        if (gradeInfo.rewrd.rdSkin) honorSkins = honorSkins.concat(gradeInfo.rewrd.rdSkin);
        logger.info(honorSkins);

        userBean.skinNum += honorSkins.length;
        userBean.grade = gradeInfo.grade;
        userBean.gradeName = gradeInfo.name;
        userBean.nextGradeExp = gradeInfo.exps[1];
        let userRankPercent = rankManager.calUserRanksSync(userBean.curExp);
        logger.info('ranks is ' + userRankPercent);

        let nextData = {
            userInfo: userBean,
            ranks: userRankPercent,
            historyInfo: historyBean,
            honors: honors,
            skins: honorSkins,
        }
        return rx.Observable.just(nextData);
    }).flatMap(it => {
        logger.info('doAction start');
        logger.info(it);
        // update user info 
        logger.info('will update user');
        let observables = [];

        observables.push(user.updateHistoryInfo(it.userInfo));
        // add game history 
        logger.info('will save history');
        observables.push(history.addHistory(it.historyInfo));
        // add honor records
        logger.info('will save honors');
        it.honors.forEach(honorBean => {
            observables.push(honorRecords.addHonorRecords(honorBean));
        });
        it.skins.forEach(skin => {
            logger.info(`will add ${JSON.stringify(skin)}`);
            observables.push(skinManager.addSkinRecord(historyBean.openId, skin));
        })
        observables.push(rx.Observable.just(it));
        // add skin records
        logger.info('todo save skin records ');
        logger.info('doAction end');
        logger.info(observables);
        return rx.Observable.forkJoin(observables);
    }).subscribe(next => {
        logger.info(next);
        if (next[0] && next[1]) {
            utils.writeHttpResponse(res, 200, 'ok', next.pop());
        } else {
            utils.writeHttpResponse(res, 200, 'ok', next);
        }
    }, error => {
        utils.writeHttpResponse(res, 601, 'error', error);
    });
}

function update(req, res, next) {
    logger.info(`history update`);
}

router.get('/add', addHistoryLogic).post('/add', addHistoryLogic);
router.get('/query', query).post('/query', query);
router.get('/update', update).post('/update', update);

module.exports = router;