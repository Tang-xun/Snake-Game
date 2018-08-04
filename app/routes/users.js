var express = require('express');
var router = express.Router();
var dao = require('../db/daoBean');
var user = require('../db/snakeUser');
var queryString = require('querystring');
var utils = require('../util/comUtils');

var logger = require('../logger').logger('route', 'info');

user.createUserTable().subscribe(next => {
    logger.info(`[create user] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create user] error ${JSON.stringify(error)}`);
});

var add = function (req, res, next) {
    printParams(req);

    var bean = new dao.User();
    bean.openId = req.param('openId');
    bean.nickName = req.param('nickName');
    bean.headUri = req.param('headUri');
    bean.score = req.param('score');

    user.insertUserInfo(bean).subscribe(next => {
        logger.info(`user add ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        utils.writeHttpResponse(res, 600, error);
    });
}

var query = function (req, res, next) {
    printParams(req);
    var openId = req.param('openId');
    user.queryUserInfo(openId).subscribe(next => {
        if (utils.isInvalid(next)) {
            utils.writeHttpResponse(res, 601, `not found user openId : ${openId}`);
        } else {
            utils.writeHttpResponse(res, 200, 'ok', JSON.stringify(next[0]));
        }
    }, error => {
        utils.writeHttpResponse(res, 600, error);
    });
}

var update = function (req, res, next) {
    printParams(req);
    var openId = req.param('openId');
    user.updateLoginTime(openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        utils.writeHttpResponse(res, 600, error);
    });
}

function printParams(req) {
    if (req == 'undefined' || req == null) {
        logger.info(`param is null`);
        return;
    }
    if (req.method == 'post') {
        logger.info(`print params ${JSON.stringify(req.body)}`);
    } else if (req.method == 'get') {
        logger.info(`print params ${JSON.stringify(req.query)}`);
    }
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

module.exports = router;




