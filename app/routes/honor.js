const express = require('express');

const dao = require('../db/daoBean');
const user = require('../db/snakeUser')
const honor = require('../db/snakeHonor');
const history = require('../db/snakeHistory');
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

function query2(req, res, next) {
    let openId = '1533544865326';
    
    let userOb = user.queryUserInfo(openId)
    let historyOb = history.queryHistory(openId, 1);

    rx.Observable.concat(userOb, historyOb).flatMap(it=>{
            let winCount = it[1].winCount;
            let time = it[0].time;
            let kill = it[0].kill;
            let length = it[0].length;
            let linkKill = it[0].linkKill;

            // winCount, length, kill, linkKill, time
            return honorManager.fetchHonorFromHistroy();
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

    logger.info(`update bean ${Object.values(bean)}`);
    logger.info(`update bean ${Object.keys(bean)}`);

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
router.get('/list', list).post('/list', list);
router.get('/update', update).post('/update', update);

module.exports = router;


query2();