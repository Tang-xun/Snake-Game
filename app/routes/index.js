var express = require('express');
var router = express.Router();
var logger = require('../logger').logger('route', 'info');

logger.info(' router indexPage');

var indexPage = function(req, res, next) {
    res.render('index', { title: 'Express' });
};

/* GET home page. */
router.get('/', indexPage);

module.exports = router;
