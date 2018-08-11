const express = require('express');

const dao = require('../db/daoBean');
const user = require('../db/snakeUser')
const honor = require('../db/snakeHonor');
const history = require('../db/snakeHistory');
const userHonors = require('../db/snakeHonorRecords');
const honorManager = require('../manager/honorManager');

const utils = require('../util/comUtils');
const logger = require('../logger').logger('route', 'info');
const rx = require('rx');

const router = express.Router();

honor.createTable().subscribe(next => {
    logger.info(`[create honor] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create honor] error ${JSON.stringify(error)}`);
})

function add(req, res, next) {
    let bean = new dao.Honor();
    bean.name = req.body.name;
    bean.gameType = req.body.gameType;
    bean.gainType = req.body.gainType;
    bean.v = req.body.v;
    bean.rewardExp = req.body.rewardExp;
    bean.skinType = req.body.skinType;
    bean.shareContent = req.body.shareContent;

    logger.info(`add ${JSON.stringify(bean)}`);
    utils.checkParams(bean);

    honor.addHonor(bean)
        .subscribe(
            next => {
                utils.writeHttpResponse(res, 200, 'ok', next);
            }, error => {
                if (error.errno == 1062) {
                    utils.writeHttpResponse(res, 602, 'honor has been add');
                } else {
                    utils.writeHttpResponse(res, 600, 'add honor error', error);
                }
            }
        )
}

function queryHonor(req, res, next) {

    let openId = req.query.openId;

    let userOb = user.queryUserInfo(openId)
    let historyOb = history.queryHistory(openId, 1);

    rx.Observable.zip(userOb, historyOb).flatMap(it => {
        // user
        let tUser = it[0][0];
        // last history
        let tHistory = it[1][0];

        if (tUser == undefined) {
            throw { error: `user[${openId}] not found ` };
        }

        if (tHistory == undefined) {
            throw { error: `history[${openId}] not found ` };
        }

        let honorNum = tUser.honorNum;

        let winCount = tUser.winCount;
        let skinNum = tUser.skinNum;
        let liveTime = tHistory.liveTime;
        let kill = tHistory.kill;
        let length = tHistory.length;
        let linkKill = tHistory.linkKill;

        let honorRecord = [tUser.winHonor, tUser.lengthHonor, tUser.killHonor, tUser.linkKillHonor, tUser.timeHonor, tUser.skinHonor];

        logger.info(`honorRecord ${honorRecord}`);
        // winCount, length, kill, linkKill, time
        return rx.Observable.zip(
            honorManager.fetchHonorFromHistroy(winCount, length, kill, linkKill, liveTime, skinNum),
            rx.Observable.just(honorRecord),
            rx.Observable.just(honorNum)
        )
    }).flatMap(it => {
        logger.info(`flat map ${JSON.stringify(it)}`);
        let lastHonor = it[0];
        let oldHonor = it[1];
        var newHonor = [];
        for (var i = 0; i < lastHonor.length; i++) {
            if (lastHonor[i] != oldHonor[i]) {
                logger.info(`gain new honor ${lastHonor[i]}`);
                newHonor.push(honorManager.fetchHonorWithCode(lastHonor[i]));
            }
        }
        return rx.Observable.just({
            code: lastHonor,
            honors: newHonor,
            honorNum: it[2]
        })
    }).doAction(it => {
        logger.info(`it.honors ${JSON.stringify(it)}`);
        if (it.honors) {
            updateHonorRecords(it, openId);
        }
    }).subscribe(next => {
        logger.info(`next ${next}`);
        utils.writeHttpResponse(res, 200, 'query honor ok', next.honors);
    }, error => {
        logger.info(`error ${error}`);
        utils.writeHttpResponse(res, 600, 'query honor error', error);
    });
}

function updateHonorRecords(it, openId) {
    logger.info(`${JSON.stringify(it)}, ${openId}`);
    let userHonorAdOb = rx.Observable.from(it.honors).flatMap(element => {
        element.openId = openId;
        let rewrdExp = element.rewardExp;
        let skinType = element.skinType;
        return userHonors.addHonorRecords(element);
    });
    let userHonorOb = user.updateHonors(openId, it.code, it.honorNum + it.honors.length);

    rx.Observable.zip(userHonorAdOb, userHonorOb).subscribe(next => {
        logger.info(`update honors next ${next}`);
    }, error => {
        logger.info(`update honors error ${error}`);
    });
}

function query(req, res, next) {
    let name = req.body.name;
    let observer = rx.Observer.create(
        next => {
            logger.info(`next ${JSON.stringify(next)}`);
            utils.writeHttpResponse(res, 200, 'ok', next);
        }, error => {
            logger.info(`error ${JSON.stringify(error)}`);
            utils.writeHttpResponse(res, 601, 'error', error);
        }
    );
    if (name) {
        honor.queryHonorWithName(name).subscribe(observer);
    } else {
        utils.writeHttpResponse(601, 'params error need name');
    }
}

function list(req, res, next) {
    let observer = rx.Observer.create(
        next => {
            logger.info(`next ${JSON.stringify(next)}`);
            utils.writeHttpResponse(res, 200, 'ok', next);
        }, error => {
            logger.info(`error ${JSON.stringify(error)}`);
            utils.writeHttpResponse(res, 601, 'error', error);
        }, () => {
            logger.info(`complete`)
        }
    );
    honor.listHonors().subscribe(observer);
}

function update(req, res, next) {

    let bean = new dao.Honor();
    bean.honorId = req.body.id;
    bean.name = req.body.name;
    bean.gameType = req.body.gameType;
    bean.gainType = req.body.gainType;
    bean.v = req.body.v;
    bean.rewardExp = req.body.rewardExp;
    bean.skinType = req.body.skinType;
    bean.shareContent = req.body.shareContent;

    let observer = rx.Observer.create(
        next => {
            logger.info(`next ${next}`);
            utils.writeHttpResponse(res, 200, 'ok', next);
        }, error => {
            logger.info(`error ${error}`);
            utils.writeHttpResponse(res, 601, 'error', error);
        }, () => {
            logger.info(`complete`)
        }
    );
    honor.updateHonor(bean).subscribe(observer);
}

router.get('/add', add).post('/add', add);
router.get('/query', query).post('/query', query);
router.get('/queryHonor', queryHonor).post('/queryHonor', queryHonor);
router.get('/list', list).post('/list', list);
router.get('/update', update).post('/update', update);

module.exports = router;