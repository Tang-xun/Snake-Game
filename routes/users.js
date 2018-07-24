var express = require('express');
var router = express.Router();

var user = require('../src/db/snake_user');

console.log('Tank ::: router users ')

// db 
var user = require('../src/db/snake_user.js');

user.createUserTable(function(err, res){
    if(err) {
      console.log(`create table error ${JSON.stringify(err)}`);
    } else {
      console.log(`create table ok ${JSON.stringify(res)}`);
    }
});

var add = function (req, res, next) {

  console.log(`Tank ::: add user info ${req.ip}`);
  if(res.method = 'GET') {
    console.log(`Tank ::: param ${JSON.stringify(req.query)}`);
  } else {
    console.log(`Tank ::: param ${JSON.stringify(req.body)}`);
  }
  var openid = req.param('openId');
  var nickName = req.param('nickName');
  user.insertUserInfo(openid, nickName, function(err, result){
      if(err) {
        res.render('index', {title: `user add fail ${err}`});
      } else {
        res.render('index', {title: `user add ok ${result}`})
      }
  });
}

var query = function (req, res, next) {
  console.log(`Tank ::: add query info ${req.ip} - ${req.method} params: ${req.params}`);
  res.render('index', { title: 'user-query' });
}

var update = function (req, res, next) {
  console.log(`Tank ::: add update info ${req.ip} - ${req.method} params: ${req.params}`);
  res.render('index', { title: 'user-update' });
}

/* GET home page. */
router.get('/add', add).post('/add', add);

router.get('/query', query).post('/query', query);

router.get('/update', update).post('update', update);

module.exports = router;