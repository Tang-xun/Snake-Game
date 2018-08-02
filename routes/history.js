var express = require('express');
var router = express.Router();
var dao = require('../app/db/daoBean');
var user = require('../app/db/snakeUser');
var utils = require('../app/util/comUtils');
var history = require('../app/db/snakeHistory');
var logger = require('../app/logger').logger('route', 'info');


history.createHistoryTable().subscribe(res => {
    if (res[0]) {
        logger.info(`[create history] error ${JSON.stringify(res[0])}`);
    } else {
        logger.info(`[create history] ok ${JSON.stringify(res[1])}`);
    }
});

function query(req, res, next) {
    var openId = req.param('openId');
    var limit = req.param('limit');
    logger.info(`history query ${openId} ${limit}`);
    history.queryHistory(openId, limit).subscribe(res => {
        logger.info(`[Event|query] ${JSON.stringify(res)}`);
        if (res[0]) {
            utils.writeHttpResponse(res, 600, res[0]);
        } else {
            utils.writeHttpResponse(res, 200, res[1]);
        }
    });
}

function add(req, res, next) {
    let bean = new dao.History();
    bean.openid = req.param('openId');
    bean.gameType = parseInt(req.param('gameType'));
    bean.exp = parseInt(req.param('exp'));
    bean.length = parseInt(req.param('length'));
    bean.bestKill = parseInt(req.param('bestKill'));
    bean.linkKill = parseInt(req.param('linkKill'));

    logger.info(`add history ${JSON.stringify(bean)}`);

    if (!checkParams(bean)) {
        logger.info(`checkParams fail`);
        utils.writeHttpResponse(res, 601, 'params check error');
    } else {
        // 查询用户信息，判断是否需要更新游戏记录
        user.queryUserInfo(bean.openid).subscribe(userRes => {
            if (userRes[0]) {
                logger.info(`query user err ${bean.openid}`);
            } else if(userRes[1] ==null) {
                logger.info(`not find this user ${bean.openid}`);
            } else {
                logger.info(`find user ${JSON.stringify(userRes[1])}`);
                var oldUser = userRes[1][0];


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

                user.updateHistoryInfo(oldUser).subscribe(updatRes=>{
                    if(updatRes[0]) {
                        logger.info(`update error ${JSON.stringify(updatRes[0])}`);
                    } else {
                        logger.info(`update ok ${JSON.stringify(updatRes[1])}`);
                    }
                });
            }
        });

        history.addHistory(bean).subscribe(historyRes => {
            logger.info(`add history ${JSON.stringify(historyRes)}`);
            if (historyRes[0]) {
                utils.writeHttpResponse(res, 601, JSON.stringify(historyRes[0]));
            } else {
                utils.writeHttpResponse(res, 200, JSON.stringify(historyRes[1]));
            }
        })
    }
}

function checkParams(history) {
    console.time('checkParams')
    var checked = typeof (history) != 'undefined' && history != null &&
        typeof (history.openid) != 'undefined' && history.openid != null &&
        typeof (history.openid) != 'undefined' && history.openid != null &&
        typeof (history.gameType) != 'undefined' && history.gameType != null &&
        typeof (history.exp) != 'undefined' && history.exp != null &&
        typeof (history.length) != 'undefined' && history.length != null &&
        typeof (history.bestKill) != 'undefined' && history.bestKill != null &&
        typeof (history.linkKill) != 'undefined' && history.linkKill != null;
    console.timeEnd('checkParams')
    return checked;
}

function update(req, res, next) {
    logger.info(`history update`);
}

router.get('/add', add).post('/add', add);
router.get('/list', query).post('/list', query);
router.get('/update', update).post('/update', update);

module.exports = router;