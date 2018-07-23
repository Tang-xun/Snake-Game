var express = require('express');
var config = require('../src/config');

var router = express.Router();
// db 
var grade = require('../src/db/snake_grade');
var user = require('../src/db/snake_user.js');

/* GET users listing. */
router.get('/', function(req, res, next) {

  console.log(`${config.now()} Tank ::: ${req.hostname}`);
  
  console.log(`${config.now()} Tank ::: ${user.toString()}`);
  console.log(`${config.now()} Tank ::: ${grade.toString()}`);
  
  res.send('respond with a resource');
});

router.get('/addUser', function(req, res, next) {
    console.log(`${config.now()} Tank ::: add user `);
})

module.exports = router;
