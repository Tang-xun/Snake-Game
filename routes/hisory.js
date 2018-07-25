var express = require('express');
var history = require('../app/db/snake_history');
var router = express.Router();

var logger = require('../app/logger').logger('route_history', 'info');

history.createHistoryTable(function (err, res) {
    if (err) {
        logger.info(`[Event|create table] error ${JSON.stringify(err)}`);
    } else {
        logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
    }
})

function query() {
    logger.info(`history query`);
}

function add() {
    logger.info(`history add`)
}

function update() {
    logger.info(`history update`)
}

router.get('/list', query);

router.get('/add', add);

router.get('/update', update);

module.exports = router;