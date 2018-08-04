var express = require('express');
var router = express.Router();
var dao = require('../app/db/daoBean');
var user = require('../app/db/snakeUser');
var utils = require('../app/util/comUtils');
var history = require('../app/db/snakeHistory');
var logger = require('../app/logger').logger('route', 'info');


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

function add(req, res, next) {
    let bean = new dao.History();
    bean.openId = req.param('openId');
    bean.gameType = parseInt(req.param('gameType'));
    bean.exp = parseInt(req.param('exp'));
    bean.length = parseInt(req.param('length'));
    bean.bestKill = parseInt(req.param('bestKill'));
    bean.linkKill = parseInt(req.param('linkKill'));

    logger.info(`add history ${JSON.stringify(bean)}`);

    if (checkParams(bean)) {
        logger.info(`checkParams fail`);
        utils.writeHttpResponse(res, 602, 'params check error');
    } else {
        // 查询用户信息，判断是否需要更新游戏记录
        user.queryUserInfo(bean.openId).subscribe(next => {
            logger.info(`find user ${JSON.stringify(next)}`);
            var oldUser = next[0];

            logger.info(`compare time model user info `);
            logger.info('=======================================');
            logger.info(`${bean.length} -- ${oldUser.t_length}`);
            logger.info(`${bean.bestKill} -- ${oldUser.t_bestKill}`);
            logger.info(`${bean.linkKill} -- ${oldUser.t_linkKill}`);
            logger.info('---------------------------------------');
            logger.info(`${bean.length} -- ${oldUser.e_length}`);
            logger.info(`${bean.bestKill} -- ${oldUser.e_bestKill}`);
            logger.info(`${bean.linkKill} -- ${oldUser.e_linkKill}`);
            logger.info('=======================================');

            if (!bean.gameType) {
                // time
                if (bean.length > oldUser.t_length) oldUser.t_length = bean.length;
                if (bean.bestKill > oldUser.t_bestKill) oldUser.t_bestKill = bean.bestKill;
                if (bean.linkKill > oldUser.t_linkKill) oldUser.t_linkKill = bean.linkKill;
            } else {
                // end
                if (bean.length > oldUser.e_length) oldUser.e_length = bean.length;
                if (bean.bestKill > oldUser.e_bestKill) oldUser.e_bestKill = bean.bestKill;
                if (bean.linkKill > oldUser.e_linkKill) oldUser.e_linkKill = bean.linkKill;
            }

            // 判断升级逻辑
            oldUser.score += bean.exp;
            oldUser.curExp += bean.exp;
            if (oldUser.curExp > oldUser.nextGradeExp) {
                oldUser.curExp = (oldUser.curExp - oldUser.nextGradeExp);
                oldUser.nextGradeExp *= 2;
                oldUser.grade += 1;
            }

            user.updateHistoryInfo(oldUser).subscribe(next => {
                logger.info(`update ok ${JSON.stringify(next)}`);
            }, error => {
                logger.info(`update error ${JSON.stringify(error)}`);
            });
        });

        history.addHistory(bean).subscribe(next => {
            utils.writeHttpResponse(res, 200, JSON.stringify(next));
        }, error => {
            utils.writeHttpResponse(res, 601, JSON.stringify(error));
        });
    }
}

function addHistory(req, res, next) {
    let bean = new dao.History();
    bean.openId = req.param('openId');
    bean.gameType = parseInt(req.param('gameType'));
    bean.exp = parseInt(req.param('exp'));
    bean.length = parseInt(req.param('length'));
    bean.bestKill = parseInt(req.param('bestKill'));
    bean.linkKill = parseInt(req.param('linkKill'));
    logger.info(`add history ${JSON.stringify(bean)}`);

    checkParams(bean);


    history.addHistory(bean).flatMap(res => {
        logger.info(`add history ok ${res}`);
        return user.queryUserInfo(bean.openId);
    }).doAction(next => {
        var user = next[0];
        

        
    }).subscribe(next => {
        logger.info(`next ${JSON.stringify(next)}`);
    }, error => {
        logger.info(`error ${JSON.stringify(error)}`);
    });
}


function checkParams(history) {
    var checked = typeof (history) == 'undefined' || history == null ||
        typeof (history.openId) == 'undefined' || history.openId == null ||
        typeof (history.gameType) == 'undefined' || history.gameType == null ||
        typeof (history.exp) == 'undefined' || history.exp == null ||
        typeof (history.length) == 'undefined' || history.length == null ||
        typeof (history.bestKill) == 'undefined' || history.bestKill == null ||
        typeof (history.linkKill) == 'undefined' || history.linkKill == null;
    return checked;
}

function update(req, res, next) {
    logger.info(`history update`);
}

router.get('/add', addHistory).post('/add', addHistory);
router.get('/query', query).post('/query', query);
router.get('/update', update).post('/update', update);

module.exports = router;