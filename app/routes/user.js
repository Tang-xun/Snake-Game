const express = require('express');
const dao = require('../db/daoBean');
const user = require('../db/snakeUser');
const utils = require('../util/comUtils');
const gradeManager = require('../manager/gradeManager');

const logger = require('../logger').logger('route', 'info');

let router = express.Router();

user.createUserTable().subscribe(next => {
    logger.info(`[create user] ok ${JSON.stringify(next)}`);
}, error => {
    logger.info(`[create user] error ${JSON.stringify(error)}`);
});

function add(req, res, next) {
    let bean = new dao.User();
    let curentGrade  = gradeManager.calculGrade(1);

    bean.openId = req.body.openId;
    bean.nickName = req.body.nickName;
    bean.headUri = req.body.headUri;
    bean.gender = req.body.gender;
    bean.language = req.body.language;
    bean.province = req.body.province;
    bean.city = req.body.city;
    bean.country = req.body.country;
    bean.score = req.body.score;
    bean.curExp = 1;
    bean.nextGradeExp = curentGrade.exps[1];
    bean.gradeName = curentGrade.name;
    bean.grade = curentGrade.grade;
    user.insertUserInfo(bean).flatMap(it=>{
        return user.queryUserInfoWithId(it);
    }).subscribe(next => {
        logger.info(`user add insertId : ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, 'add user ok', next);
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
            utils.writeHttpResponse(res, 603, `not found user openId : ${openId}`);
        } else {
            utils.writeHttpResponse(res, 200, 'ok', next[0]);
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
        utils.writeHttpResponse(res, 601, 'ok', error);
    });
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

module.exports = router;
