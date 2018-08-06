var express = require('express');
var router = express.Router();
var dao = require('../db/daoBean');
var user = require('../db/snakeUser');
var utils = require('../util/comUtils');

var logger = require('../logger').logger('route', 'info');

const { check, validationResult } = require('express-validator/check');

user.createUserTable().subscribe(next => {
    logger.info(`[create user] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create user] error ${JSON.stringify(error)}`);
});

var add = function (req, res, next) {
    var bean = new dao.User();

    bean.openId = req.body.openId;
    bean.nickName = req.body.nickName;
    bean.headUri = req.body.headUri;
    bean.city = req.body.city;
    bean.score = req.body.score;
    bean.gender = req.body.gender;
    bean.province = req.body.province;
    bean.country = req.body.country;
    bean.language = req.body.language;
    logger.info(`will add bean ${JSON.stringify(bean)}`);
    
    const errors = validationResult(req);
    logger.info(`query errors ${JSON.stringify(errors)}`);


    user.insertUserInfo(bean).subscribe(next => {
        logger.info(`user add ${JSON.stringify(next)}`);
        if (next > 0) {
            utils.writeHttpResponse(res, 200, 'add user ok');
        } else {
            utils.writeHttpResponse(res, 602, `add user error ${next}`);
        }
    }, error => {
        utils.writeHttpResponse(res, 601, error);
    });

}

var query = function (req, res, next) {

    const errors = validationResult(req);
    logger.info(`query errors ${JSON.stringify(errors)}`);
    if (!errors.isEmpty()) {
        utils.writeHttpResponse(res, 600, 'check params error', JSON.stringify(errors));
        return;
    }
    var openId = req.body.openId;
    user.queryUserInfo(openId).subscribe(next => {
        if (utils.isInvalid(next)) {
            utils.writeHttpResponse(res, 602, `not found user openId : ${openId}`);
        } else {
            utils.writeHttpResponse(res, 200, 'ok', JSON.stringify(next[0]));
        }
    }, error => {
        utils.writeHttpResponse(res, 601, error);
    });
}

var update = function (req, res, next) {
    var openId = req.param('openId');
    user.updateLoginTime(openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        utils.writeHttpResponse(res, 601, error);
    });
}

/* GET home page. */
router.get('/add', add).post('/add', [
    check('openId').isLength({ min: 5 }),
    check('nickName').isLength({ min: 5 })
], add);

router.get('/query', query).post('/query', [
    check('openId').isEmail()
], query);

router.get('/update', update).post('update', update);

module.exports = router;
