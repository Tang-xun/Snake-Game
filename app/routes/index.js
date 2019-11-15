const express = require('express');
const logger = require('../logger').logger('route', 'info');

let router = express.Router();

logger.info(' router indexPage');
function indexPage(req, res, next) {
    res.render('index', { title: 'Express' });
};

/* GET home page. */
router.get('/', indexPage);

module.exports = router;
