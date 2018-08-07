const express = require('express');
const dao = require('../db/daoBean');
const user = require('../db/snakeUser');
const utils = require('../util/comUtils');
const history = require('../db/snakeHistory');
const logger = require('../logger').logger('route', 'info');
const rx = require('rx');

let router = express.Router();

history.createHistoryTable().subscribe(next => {
    logger.info(`[create history] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create history] error ${JSON.stringify(error)}`);
});

function query(req, res, next) {
    let openId = req.param('openId');
    let limit = req.param('limit');
    logger.info(`history query ${openId} ${limit}`);
    history.queryHistory(openId, limit).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 600, 'error', error);
    });
}

function addHistory(req, res, next) {
    let bean = new dao.History();
    bean.openId = req.param('openId');
    bean.gameType = parseInt(req.param('gameType'));
    bean.score = parseInt(req.param('score'));
    bean.length = parseInt(req.param('length'));
    bean.bestKill = parseInt(req.param('bestKill'));
    bean.linkKill = parseInt(req.param('linkKill'));
    logger.info(`add history ${JSON.stringify(bean)}`);

    if (checkParams(bean)) {
        logger.error(`params check error : ${JSON.stringify(bean)}`);
        utils.writeHttpResponse(res, 600, `params check error`);
        return;
    }

    user.queryUpdateInfo(bean.openId).flatMap(next => {
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
        // 判断升级逻辑
        oUser.score += bean.score;
        oUser.curExp += bean.score;
        if (oUser.curExp > oUser.nextGradeExp) {
            oUser.curExp = (oUser.curExp - oUser.nextGradeExp);
            oUser.nextGradeExp *= 2;
            oUser.grade += 1;
        }
        return rx.Observable.combineLatest(
            history.addHistory(bean),
            utils.calUserRanks(oUser.score),
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