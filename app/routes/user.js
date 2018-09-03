const express = require('express');
const dao = require('../db/daoBean');
const user = require('../db/snakeUser');
const utils = require('../util/comUtils');
const gradeManager = require('../manager/gradeManager');

const coreServer = require('../manager/rankManager');
const rx = require('rx');
const logger = require('../logger').logger('route', 'info');

let router = express.Router();

user.createUserTable().subscribe(next => {
    logger.info(`[create user] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create user] error ${JSON.stringify(error)}`);
});

function add(req, res, next) {
    let userBean = new dao.User().init(req.body);
    let curentGrade = gradeManager.calculGrade(1);
    userBean.curExp = 1;
    userBean.nextGradeExp = curentGrade.exps[1];
    userBean.gradeName = curentGrade.name;
    userBean.grade = curentGrade.grade;

    user.insertUserInfo(userBean).catch(error => {
        logger.info(`catch ${error}`);
        if (error.errno == 1062) {
            logger.info(`do on Error user has bean added `);
            return user.queryUserInfo(userBean.openId);
        }
        throw error;
    }).flatMap(it => {
        logger.info('flatMap it ' + (it instanceof Object) + '\t' + JSON.stringify(it) + '\t');
        if (it instanceof Object) {
            return rx.Observable.just(it);
        } else {
            return user.queryUserInfoWithId(it).map(its => {
                its.create = true;
                return its;
            });
        }
    }).subscribe(next => {
        logger.info(`user add : ${JSON.stringify(next)}`);
        if (next.create) {
            utils.writeHttpResponse(res, 200, 'user add ok', next);
        } else {
            utils.writeHttpResponse(res, 602, 'user has bean add', next);
        }
    }, error => {
        logger.info(`error ${error}`)
        utils.writeHttpResponse(res, 601, 'error', error);
    });
}

function query(req, res, next) {
    let openId = req.body.openId;
    user.queryUserInfo(openId).subscribe(next => {
        if (utils.isInvalid(next)) {
            utils.writeHttpResponse(res, 603, `not found user openId : ${openId}`);
        } else {
            utils.writeHttpResponse(res, 200, 'ok', next);
        }
    }, error => {
        utils.writeHttpResponse(res, 601, 'error', error);
    });
}

function update(req, res, next) {
    let openId = req.body.openId;
    user.updateLoginTime(openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 601, 'error', error);
    });
}

function ranklist(req, res, next) {
    user.queryRankList().subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 600, 'error', error);
    })
}

function queryAppAward(req, res, next) {
    let openId = req.method == 'POST' ? req.body.openId : req.query.openId;
    user.queryLatestTime(openId).flatMap(it => {
        logger.info('queryLatestTime ::: ');
        logger.info(it);
        
        let now = new Date();
        let lastest = new Date(it);
        let diff = now - lastest;
        
        let addCount = Math.floor(diff / (1000 * 60 * 18));
        addCount = addCount > 10 ? 10 : addCount;
        addCount = addCount < 0 ? 0 : addCount;
        
        logger.info(`now : ${now} \t lastest : ${lastest} \t count : ${addCount}`);
        return rx.Observable.just({
            openId: openId,
            count: addCount,
            time: lastest.toLocaleString()
        });
    }).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 600, 'error', error);
    })
}

function fetchAppAward(req, res, next) {
    let openId = req.method == 'POST' ? req.body.openId : req.query.openId;
    user.queryLatestTime(openId).flatMap(it => {
        logger.info('queryLatestTime ::: ');
        logger.info(it);
        
        let now = new Date();
        let lastest = new Date(it);
        let diff = now - lastest;
        
        let addCount = Math.floor(diff / (1000 * 60 * 18));
        addCount = addCount > 10 ? 10 : addCount;
        addCount = addCount < 0 ? 0 : addCount;
        return user.updateAppCount(openId, addCount);
    }).flatMap(it => {
        return user.queryUserInfo(openId);
    }).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 600, 'error', error);
    })
}

function queryName(req, res, next) {
    let openId = req.method == 'POST' ? req.body.openId : req.query.openId;
    let userNames = coreServer.getPlayNickName();
    if (userNames != undefined && userNames.length == 50) {
        utils.writeHttpResponse(res, 200, 'ok', userNames);
    } else {
        utils.writeHttpResponse(res, 600, 'error', userNames);
    }
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

router.get('/ranklist', ranklist).post('ranklist', ranklist);

router.get('/fetchAppAward', fetchAppAward).post('/fetchAppAward', fetchAppAward);

router.get('/queryAppAward', queryAppAward).post('/queryAppAward', queryAppAward);

router.get('/queryPlayerName', queryName).post('/queryPlayerName', queryName);


module.exports = router;
