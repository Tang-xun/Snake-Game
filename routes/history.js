var express = require('express');
var history = require('../app/db/snakeHistory');

var user = require('../app/db/snakeUser');
var router = express.Router();
var dao = require('../app/db/daoBean');

var logger = require('../app/logger').logger('route', 'info');

history.createHistoryTable(function (err, res) {
    if (err) {
        logger.info(`[Event|create table] error ${JSON.stringify(err)}`);
    } else {
        logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
    }
})

function query(req, res, next) {
    logger.info(`history query`);
}

function add(req, res, next) {
    logger.info(`history add`)
    
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
        res.write({
            'code': 601,
            'msg': 'params check error',
            bean,
        });
        res.end();
    } else {
        // 查询用户信息，判断是否需要更新游戏记录
        user.queryUserInfo(bean.openid, function (err, userRes) {
            if (err) {
                logger.info(`query user err ${err}`);
            } else {
                
                var oldUser = userRes.length > 0 ? userRes[0] : null;
                
                logger.info(`query user ok ${bean}`);
                
                logger.info(`query user ok ${JSON.stringify(oldUser)}`);
                var isNeedUpDate = false;
                
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
                    if (bean.length > oldUser.t_length) {
                        oldUser.t_length = bean.length;
                    }
                    if (bean.bestKill > oldUser.t_bestKill) {
                        oldUser.t_bestKill = bean.bestKill;
                    }
                    if (bean.linkKill > oldUser.t_linkKill) {
                        oldUser.t_linkKill = bean.linkKill;
                    }
                } else {
                    // end
                    if (bean.length > oldUser.e_length) {
                        oldUser.e_length = bean.length;
                    }
                    if (bean.bestKill > oldUser.e_bestKill) {
                        oldUser.e_bestKill = bean.bestKill;
                    }
                    if (bean.linkKill > oldUser.e_linkKill) {
                        oldUser.e_linkKill = bean.linkKill;
                    }
                }

                // 判断升级逻辑
                oldUser.curExp += bean.exp;
                if (oldUser.curExp > oldUser.nextGradeExp) {
                    oldUser.curExp = (oldUser.curExp - oldUser.nextGradeExp);
                    oldUser.nextGradeExp *= 2;
                }

                user.updateHistoryInfo(oldUser);
            }
        });

        history.addHistory(bean, function (err, historyRes) {
            if (err) {
                logger.info(`add error ${err}`);
                res.render('index', { title: 'add history error', content: `${err}` });
                res.write(`{
                    code:601,
                    msg:${err.msg},
                }`);
            } else {
                logger.info(`add ok ${JSON.stringify(historyRes)}`);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write(`{
                    code:200,
                    msg:ok,
                }`);
            }
            res.end();

        })
    }
}

function checkParams(history) {
    console.time('checkParams')
    var checked =  typeof (history) != 'undefined' && history != null &&
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
    logger.info(`history update`)
}

router.get('/list', query).post('/list', query);

router.post('/add', add);

router.post('/update', update);

module.exports = router;