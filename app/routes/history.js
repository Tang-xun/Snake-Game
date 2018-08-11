import { throwError } from 'rxjs';

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

function createHistory(res) {
    let history = new dao.History();
    bean.openId = req.body.openId;
    bean.gameType = req.body.gameType;
    bean.score = req.body.score;
    bean.rank = req.body.rank;
    bean.time = req.body.time;
    bean.length = req.body.length;
    bean.bestKill = req.body.bestKill;
    bean.linkKill = req.body.linkKill;
    bean.deadTimes = req.body.deadTimes;
    return history;
}

function addHistory(req, res, next) {
    let bean = createHistory(res);
    logger.info(`add history ${JSON.stringify(bean)}`);

    if (checkParams(bean)) {
        logger.error(`params check error : ${JSON.stringify(bean)}`);
        utils.writeHttpResponse(res, 600, `params check error`);
        return;
    }

    user.queryUpdateInfo(bean.openId).flatMap(next => {
        
        return rx.Observable.ifThen(next == undefined, rx.Observable.throwError('User info not found'), )

        logger.info(`do action first ${JSON.stringify(next)}`);
        let oUser = next;
        // handle user game records logic
        if (!bean.gameType) {
            // time model
            if (bean.length > oUser.t_length) oUser.t_length = bean.length;
            if (bean.bestKill > oUser.t_bestKill) oUser.t_bestKill = bean.bestKill;
            if (bean.linkKill > oUser.t_linkKill) oUser.t_linkKill = bean.linkKill;
        } else {
            // end model
            if (bean.length > oUser.e_length) oUser.e_length = bean.length;
            if (bean.bestKill > oUser.e_bestKill) oUser.e_bestKill = bean.bestKill;
            if (bean.linkKill > oUser.e_linkKill) oUser.e_linkKill = bean.linkKill;
        }
        // round rank first 
        if (bean.rank == 1) oUser.winCount++;

        // 判断升级逻辑
        let increament_exp = gradeManager.calculExp(bean.rank, bean.bestKill, bean.linkKill, bean.time, bean.deadTimes);
        oUser.curExp += increament_exp;

        let gradeInfo = gradeManager.calculGrade(oUser.curExp);
        logger.info(`cal grader ${gradeInfo}`);

        if (oUser.curExp > oUser.nextGradeExp) {
            oUser.grade = gradeInfo.grade;
            oUser.nextGradeExp = gradeInfo.exps[1];
            oUser.gradeName = gradeInfo.name;
        }

        return rx.Observable.combineLatest(
            history.addHistory(bean),
            rankServer.calUserRanks(oUser.curExp),
            user.updateHistoryInfo(oUser),
            user.queryUpdateInfo(oUser.openId));
    }).subscribe(next => {
        logger.info(`next ${JSON.stringify(next)}`);
        let data = {
            historyId: next[0],
            percent: next[1],
            updateUser: next[2],
            userInfo: next[3]
        };
        utils.writeHttpResponse(res, 200, 'add history ok ', data);
    }, error => {
        logger.error(`error ${error}`);
        utils.writeHttpResponse(res, 600, `add history error`, error);
    });
}


function checkParams(history) {
    let checked = (history == null ||
        history.openId.trim().length == 0 ||
        history.gameType == null ||
        isNaN(history.score) ||
        isNaN(history.length) ||
        isNaN(history.bestKill) ||
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