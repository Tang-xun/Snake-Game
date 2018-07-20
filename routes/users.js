var express = require('express');
var router = express.Router();

var userDb = require('../src/db/user.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(`tank ${JSON.stringify(req.hostname)}`);
  
  userDb.createUserTable;

  res.send('respond with a resource');
});

module.exports = router;
