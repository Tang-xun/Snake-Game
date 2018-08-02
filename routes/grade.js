var express = require('express');
var grade = require('../app/db/snakeGrade');
var router = express.Router();
var logger = require('../app/logger').logger('route', 'info');

grade.createGradeTable().subscribe( res=> {
    if (res[0]) {
        logger.error(`[create grade] error ${JSON.stringify(res[0])}`);
    } else {
        logger.info(`[create grade] ok ${JSON.stringify(res[1])}`);
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

router.get('/add', add).post('/add', add);
router.get('/list', query).post('/list', query);
router.get('/update', update).post('/update', update);

module.exports = router;