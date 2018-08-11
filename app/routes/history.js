const express = require('express');
const dao = require('../db/daoBean');
const user = require('../db/snakeUser');
const utils = require('../util/comUtils');
const history = require('../db/snakeHistory');
const rankServer = require('../manager/rankManager');
const gradeManager = require('../manager/gradeManager');

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

function createHistory(req, bean) {
    bean.openId = req.body.openId;
    bean.gameType = parseInt(req.body.gameType);
    bean.roundRank = parseInt(req.body.roundRank);
    if (bean.gameType) {
        bean.liveTime = parseInt(req.body.liveTime);
    } else {
        bean.liveTime = 0;
    }
    bean.length = parseInt(req.body.length);
    bean.bestKill = parseInt(req.body.bestKill);
    bean.linkKill = parseInt(req.body.linkKill);
    bean.deadTimes = parseInt(req.body.deadTimes);
}

function addHistory(req, res, next) {
    let bean = new dao.History();
    createHistory(req, bean);

    logger.info(`add history ${JSON.stringify(bean)}`);

    if (checkParams(bean)) {
        logger.error(`params check error : ${JSON.stringify(bean)}`);
        utils.writeHttpResponse(res, 600, `params check error`);
        return;
    }
    let midError = '';
    user.queryUpdateInfo(bean.openId).flatMap(next => {
        if (next == undefined) {
            midError = 'user not exists';
            throw Error('user not exists');
        }
        return rx.Observable.just(next);
    }).flatMap(next => {
        logger.info(`do action first ${JSON.stringify(next)}`);
        let oUser = next;

        // handle user game records logic
        if (!bean.gameType) {
            // time model
            if (bean.length > oUser.t_length) oUser.t_length = bean.length;
            if (bean.bestKill > oUser.t_bestKill) oUser.t_bestKill = bean.bestKill;
            if (bean.linkKill > oUser.t_linkKill) oUser.t_linkKill = bean.linkKill;
        } else {
            // endless model
            if (bean.length > oUser.e_length) oUser.e_length = bean.length;
            if (bean.bestKill > oUser.e_bestKill) oUser.e_bestKill = bean.bestKill;
            if (bean.linkKill > oUser.e_linkKill) oUser.e_linkKill = bean.linkKill;
            if (bean.liveTime > oUser.liveTime) oUser.liveTime = bean.liveTime;
        }
        // round rank first 
        if (bean.roundRank == 1) oUser.winCount++;

        // 判断升级逻辑
        let increament_exp = gradeManager.calculExp(bean.roundRank, bean.bestKill, bean.linkKill, bean.liveTime, bean.deadTimes);
        oUser.curExp += increament_exp;

        let gradeInfo = gradeManager.calculGrade(oUser.curExp);
        logger.info(`cal grader ${JSON.stringify(gradeInfo)}`);
        let rewrd = null;
        if (oUser.curExp > oUser.nextGradeExp) {
            oUser.grade = gradeInfo.grade;
            oUser.nextGradeExp = gradeInfo.exps[1];
            oUser.gradeName = gradeInfo.name;
            // 处理升级奖励
            rewrd = gradeInfo.rewrd;
            if (rewrd) {
                oUser.curExp += rewrd.rdExp ? rewrd.rdExp : 0;
                oUser.skinNum += rewrd.rdSkin.length;
            }
        }

        return rx.Observable.combineLatest(
            history.addHistory(bean),
            rankServer.calUserRanks(oUser.curExp),
            user.updateHistoryInfo(oUser),
            rx.Observable.just(oUser),
            rx.Observable.just(rewrd ? rewrd : 0)
        );
    }).subscribe(next => {
        logger.info(`next ${JSON.stringify(next)}`);
        let data = {
            historyId: next[0],
            ranks: next[1],
            updateUser: next[2],
            userInfo: next[3],
            reward: next[4],
        };
        utils.writeHttpResponse(res, 200, 'add history ok ', data);
    }, error => {
        logger.error(`error ${JSON.stringify(midError)} ${JSON.stringify(error)}`);
        utils.writeHttpResponse(res, 600, `add history error ` + (midError ? midError : ''));
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

function update(req, res, next) {
    logger.info(`history update`);
}

router.get('/add', addHistory).post('/add', addHistory);
router.get('/query', query).post('/query', query);
router.get('/update', update).post('/update', update);

module.exports = router;