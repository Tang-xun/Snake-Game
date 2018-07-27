var express = require('express');
var history = require('../app/db/snakeHistory');

var user = require('../app/db/snakeUser');
var router = express.Router();
var bean = require('../app/db/daoBean');

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
    var bean = new bean.History();
    bean.openid = req.param('openid');
    bean.game_model = req.param('game_model');
    bean.game_score = req.param('game_score');
    bean.length = req.param('length');
    bean.bestKill = req.param('bestKill');
    bean.linkKill = req.param('linkKill');

    if (!checkParams(bean)) {
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
                console.err(`query user err ${err}`);
            } else {
                console.info(`query user ok ${userRes}`);
                var isNeedUpDate = false;

                if (!bean.game_model) {
                    // time
                    if (bean.length > userRes.t_bestLen) {
                        userRes.t_bestLen = bean.length;
                        isNeedUpDate = true;
                    }
                    if (bean.bestKill > userRes.t_mostKill) {
                        userRes.t_mostKill = bean.bestKill;
                        isNeedUpDate = true;
                    }
                    if (bean.linkKill > userRes.t_linkKill) {
                        userRes.t_linkKill = bean.linkKill;
                        isNeedUpDate = true;
                    }
                } else {
                    // end
                    if (bean.length > userRes.e_bestLen) {
                        userRes.e_bestLen = bean.length;
                        isNeedUpDate = true;
                    }
                    if (bean.bestKill > userRes.e_mostKill) {
                        userRes.e_mostKill = bean.bestKill;
                        isNeedUpDate = true;
                    }
                    if (bean.linkKill > userRes.e_linkKill) {
                        userRes.t_linkKill = bean.linkKill;
                        isNeedUpDate = true;
                    }
                }
                if (isNeedUpDate) {
                    user.updateHistoryInfo(userRes);
                }
            }
        });

        history.addHistory(bean, function (err, historyRes) {
            if (err) {
                console.error(`add error ${err}`);
                res.render('index', { title: 'add history error', content: `${err}` });
                res.write(`{
                    code:601,
                    msg:${err.msg},
                }`);
            } else {
                console.error(`add ok ${historyRes}`);
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
    return typeof (history) != 'undefined' && history != null &&
        typeof (history.openid) != 'undefined' && history.openid != null &&
        typeof (history.openid) != 'undefined' && history.openid != null &&
        typeof (history.game_model) != 'undefined' && history.game_model != null &&
        typeof (history.game_score) != 'undefined' && history.game_score != null &&
        typeof (history.length) != 'undefined' && history.length != null &&
        typeof (history.bestKill) != 'undefined' && history.bestKill != null &&
        typeof (history.linkKill) != 'undefined' && history.linkKill != null;
}

function update(req, res, next) {
    logger.info(`history update`)
}

router.get('/list', query).post('/list', query);

router.get('/add', add).post('/add', add);

router.get('/update', update).post('/update', update);

module.exports = router;