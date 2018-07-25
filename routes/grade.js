var express = require('express');
var grade = require('../app/db/snake_grade');
var router = express.Router();
var logger = require('../app/logger').logger('route_grade', 'info');

grade.createGradeTable(function (err, res) {
    if (err) {
        logger.error(`[Event|create table] error ${JSON.stringify(err)}`);
    } else {
        logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
    }
})

function query() {
    logger.info(`grade query`);
}

function add() {
    logger.info(`grade add`)
}

function update() {
    logger.info(`grade update`)
}

router.get('/list', query);

router.get('/add', add);

router.get('/update', update);

module.exports = router;