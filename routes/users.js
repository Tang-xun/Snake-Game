var express = require('express');
var router = express.Router();
var dao = require('../app/db/daoBean');
var user = require('../app/db/snakeUser');
var queryString = require('querystring');
var utils = require('../app/util/comUtils');

var logger = require('../app/logger').logger('route', 'info');

user.createUserTable().subscribe(res => {
  if (res[0]) {
    logger.info(`[create user] error ${JSON.stringify(res[0])}`);
  } else {
    logger.info(`[create user] ok ${JSON.stringify(res[1])}`);
  }
});

var add = function (req, res, next) {
  printParams(req);

  var bean = new dao.User();
  bean.openId = req.param('openId');
  bean.nickName = req.param('nickName');
  bean.headUri = req.param('headUri');
  bean.score = req.param('score');

  user.insertUserInfo(bean).subscribe(addRes => {
    logger.info(`user add ${JSON.stringify(addRes)}`);
    if (addRes[0]) {
      utils.writeHttpResponse(res, 600, addRes[0]);
    } else {
      utils.writeHttpResponse(res, 200, addRes[1]);
    }
  });
}

var query = function (req, res, next) {
  printParams(req);
  var openId = req.param('openId');
  user.queryUserInfo(openId).subscribe(queryRes => {
    if (queryRes[0]) {
      utils.writeHttpResponse(res, 600, queryRes[0]);
    } else {
      utils.writeHttpResponse(res, 200, queryRes[1]);
    }
  });
}

var update = function (req, res, next) {
  printParams(req);
  var openId = req.param('openId');
  user.updateLoginTime(openId).subscribe(updateRes => {
    if (updateRes[0]) {
      utils.writeHttpResponse(res, 600, updateRes[0]);
    } else {
      utils.writeHttpResponse(res, 200, updateRes[1]);
    }
  });
}

function printParams(req) {
  if (req == 'undefined' || req == null) {
    logger.info(`param is null`);
    return;
  }
  logger.info(`print params ${JSON.stringify(req.body)}`);
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

module.exports = router;




