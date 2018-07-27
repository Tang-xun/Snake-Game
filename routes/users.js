var express = require('express');
var router = express.Router();

var user = require('../app/db/snakeUser');

var logger = require('../app/logger').logger('route', 'info');

logger.info('router users ')

user.createUserTable(function (err, res) {
  if (err) {
    logger.info(`[Event|create table] error ${JSON.stringify(err)}`);
  } else {
    logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
  }
});

var add = function (req, res, next) {

  logger.info(` add user info ${req.ip}`);
  printParams(res, req);
  var openid = req.param('openId');
  var nickName = req.param('nickName');
  user.insertUserInfo(openid, nickName, function (err, result) {
    if (err) {
      res.render('content', { title: 'user add fail', content: `${JSON.stringify(err)}` });
    } else {
      res.render('content', { title: 'user add ok', content: `${JSON.stringify(result)}` })
    }
  });
}

var query = function (req, res, next) {
  printParams(req);
  var openid = req.param('openId');
  user.queryUserInfo(openid, function (err, result) {
    if (err) {
      res.render('content', { title: 'user query faile', content: `${JSON.stringify(err)}` });
    } else {
      res.render('content', { title: 'user query ok', content: `${JSON.stringify(result)}` });
    }
  });
}

var update = function (req, res, next) {
  printParams(req);
  var openid = req.param('openId');
  user.updateLoginTime(openid, function (err, result) {
    if (err) {
      res.render('content', { title: 'user updateLoginTime faile', content: `${JSON.stringify(err)}` });
    } else {
      res.render('content', { title: 'user updateLoginTime ok', content: `${JSON.stringify(result)}` });
    }
  });
}

function printParams(req) {
  if (req == 'undefined' || req == null) {
    logger.info(`param is null`);
    return;
  }

  logger.info(` ${req.ip} ${req.method}`);
  if (req.method = 'GET') {
    logger.info(`param ${JSON.stringify(req.query)}`);
  }
  else {
    logger.info(`param ${JSON.stringify(req.body)}`);
  }
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

module.exports = router;


