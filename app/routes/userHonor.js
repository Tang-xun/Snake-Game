const rx = require('rx');
const express = require('express');

const router = express.Router();

const honorRecords = require('../db/snakehonorrecords');
const logger = require('../logger').logger('userhonor', 'info');
const utils = require('../util/comUtils');

honorRecords.createHonorRecordsTable().subscribe(
    next => {
        logger.info(`[create honorrecords] ok ${next}`);
    }, error => {
        logger.error(`[create honorrecords] error ${error}`);
    }
);

function query(req, res, next) {
    let openid = req.body.openid;
    honorRecords.queryUserHonor(openid).subscribe(
        next => {
            logger.info(`query honorRecore ${JSON.stringify(next)}`);
            utils.writeHttpResponse(res, 200, 'success', next);
        }, error => {
            logger.info(`query honorRecore error ${JSON.stringify(error)}`);
            utils.writeHttpResponse(res, 600, 'error', error);
        }, () => {
            logger.info(`query complete `);
        }
    );
}

router.get('/query', query).post('/query', query);

module.exports = router;