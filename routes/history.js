var express = require('express');
var router = express.Router();
var dao = require('../app/db/daoBean');
var user = require('../app/db/snakeUser');
var utils = require('../app/util/comUtils');
var history = require('../app/db/snakeHistory');
var logger = require('../app/logger').logger('route', 'info');
var rx = require('rx');

history.createHistoryTable().subscribe(next => {
    logger.info(`[create history] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create history] error ${JSON.stringify(error)}`);
});

function query(req, res, next) {
    var openId = req.param('openId');
    var limit = req.param('limit');
    logger.info(`history query ${openId} ${limit}`);
    history.queryHistory(openId, limit).subscribe(next => {
        utils.writeHttpResponse(res, 200, JSON.stringify(next));
    }, error => {
        utils.writeHttpResponse(res, 600, error);
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

    history.addHistory(bean).flatMap(res => {
        logger.info(`add history ok ${JSON.stringify(res)}`);
        return user.queryUserInfo(bean.openId);
    }).flatMap(next => {
        logger.info(`do action first ${JSON.stringify(next)}`);
        var oUser = next[0];
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
        return user.updateHistoryInfo(oUser);
    }).subscribe(next => {
        utils.calUserRanks(user.score);
        logger.info(`next ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, 'add history ok ');
    }, error => {
        logger.info(`error ${JSON.stringify(error)}`);
        utils.writeHttpResponse(res, 600, `add history error ${JSON.stringify(error)} `);
    });
}


function checkParams(history) {
    var checked = (history == null ||
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