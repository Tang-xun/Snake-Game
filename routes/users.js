var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(`tank ${JSON.stringify(req.hostname)}`);
  res.send('respond with a resource');
});

module.exports = router;
