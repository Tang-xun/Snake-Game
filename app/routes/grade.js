const express = require('express');
const grade = require('../db/snakeGrade');
const logger = require('../logger').logger('route', 'debug');

let router = express.Router();

grade.createGradeTable().subscribe(next => {
    logger.info(`[create grade] ok ${JSON.stringify(next)}`);
}, error => {
    logger.error(`[create grade] error ${JSON.stringify(error)}`);
});

function query(req, res, next) {
    logger.info(`grade query`);
    res.render('index', { title: 'grade query', content: 'noting to show ' });
}

function add(req, res, next) {
    logger.info(`grade add`);
    res.render('index', { title: 'grade add', content: 'noting to show ' });
}

function update(req, res, next) {
    logger.info(`grade update`)
    res.render('index', { title: 'grade update', content: 'noting to show ' });
}

router.get('/add', add).post('/add', add);
router.get('/list', query).post('/list', query);
router.get('/update', update).post('/update', update);

module.exports = router;