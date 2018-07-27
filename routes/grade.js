var express = require('express');
var grade = require('../app/db/snakeGrade');
var router = express.Router();
var logger = require('../app/logger').logger('route', 'info');

grade.createGradeTable(function (err, res) {
    if (err) {
        logger.error(`[Event|create table] error ${JSON.stringify(err)}`);
    } else {
        logger.info(`[Event|create table] ok ${JSON.stringify(res)}`);
    }
})

function query(req, res, next) {


    logger.info(`grade query`);
    res.render('index', {title:'grade query' , content:'noting to show '});
}

function add(req, res, next) {
    logger.info(`grade add`);
    res.render('index', {title:'grade add' , content:'noting to show '});
}

function update(req, res, next) {
    logger.info(`grade update`)
    res.render('index', {title:'grade update' , content:'noting to show '});
}

router.get('/list', query);

router.get('/add', add);

router.get('/update', update);

module.exports = router;