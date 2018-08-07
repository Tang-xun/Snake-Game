const express = require('express');
const dao = require('../db/daoBean');
const user = require('../db/snakeUser');
const utils = require('../util/comUtils');
const logger = require('../logger').logger('route', 'info');

let router = express.Router();

user.createUserTable().subscribe(next => {
    logger.info(`[create user] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create user] error ${JSON.stringify(error)}`);
});

function add(req, res, next) {
    let bean = new dao.User();
    bean.openId = req.body.openId;
    bean.nickName = req.body.nickName;
    bean.headUri = req.body.headUri;
    bean.city = req.body.city;
    bean.score = req.body.score;
    bean.gender = req.body.gender;
    bean.province = req.body.province;
    bean.country = req.body.country;
    bean.language = req.body.language;

    logger.info(`first ${JSON.stringify(bean)}`);

    utils.checkParams(bean);

    bean.language = 'undefined';

    utils.checkParams(bean);

    logger.info(`second ${JSON.stringify(bean)}`);

    user.insertUserInfo(bean).subscribe(next => {
        logger.info(`user add insertId : ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, 'add user ok');
    }, error => {
        if (error.errno == 1062) {
            utils.writeHttpResponse(res, 602, 'user has bean registered');
        } else {
            utils.writeHttpResponse(res, 601, 'error', error);
        }
    });
}

function query(req, res, next) {
    let openId = req.body.openId;
    user.queryUserInfo(openId).subscribe(next => {
        if (utils.isInvalid(next)) {
            utils.writeHttpResponse(res, 602, `not found user openId : ${openId}`);
        } else {
            utils.writeHttpResponse(res, 200, 'ok', next[0]);
        }
    }, error => {
        utils.writeHttpResponse(res, 601, 'error', error);
    });
}

function update(req, res, next) {
    let openId = req.param('openId');
    user.updateLoginTime(openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 601, 'ok', error);
    });
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

module.exports = router;
