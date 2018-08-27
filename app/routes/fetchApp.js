const rx = require('rx');
const express = require('express');
const user = require('../db/snakeUser');
const fetchApp = require('../db/snakeFetchApp');
const utils = require('../util/comUtils');
const logger = require('../logger').logger('router-fetchApp', 'info');
const router = express.Router();

fetchApp.createFetchApp().subscribe(next => {
    logger.info(`[create fetchApp] ok ${JSON.stringify(next)}`);
}, error => {
    logger.error(`[create fetchApp] error ${JSON.stringify(error)}`);
})

function query(req, res, next) {
    let openId = req.method == 'POST' ? req.body.openId : req.query.openId;
    rx.Observable.zip(user.queryAppCount(openId), fetchApp.queryFetchTime(openId)).flatMap(it => {
        let now = new Date();
        let appCount = it[0];
        let latest = new Date(it[1]);
        let diff = now - latest;
        let increamCount = Math.floor(diff / (1000 * 60 * 18));
        logger.info(`query now : ${now} \t latest : ${latest}\tdiff : ${diff} \t appCount : ${appCount} \t increament ${increamCount}`);
        return rx.Observable.zip(user.updateAppCount(openId, appCount + increamCount), fetchApp.updateFetchTime(openId));
    }).subscribe(it => {
        logger.info('next :::: ');
        logger.info(it);
    }, error => {
        logger.info(error);
    });
    res.render('index', { title: 'fetchApp query', content: 'noting to show ' });
}

function updateFetchTime(req, res, next) {
    let openId = req.method == 'POST' ? req.body.openId : req.query.openId;
    fetchApp.updateFetchTime(openId).subscribe(it => {
        logger.info('next ::: ');
        logger.info(it);
        utils.writeHttpResponse(res, 200, 'fetch app ok', it);
    }, error => {
        logger.info('error ::: ');
        logger.error(error);
        utils.writeHttpResponse(res, 600, 'fetch app error', error);
    });
}

router.get('/query', query).post('/query', query);
router.get('/fetch', updateFetchTime).post('/fetch', updateFetchTime);

module.exports = router;