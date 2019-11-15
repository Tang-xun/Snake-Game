let express = require('express');
let router = express.Router();
let utils = require('../util/comUtils');
let logger = require('../logger').logger('skin', 'info');
let skinRecord = require('../db/snakeSkinRecords');

skinRecord.createSkinRecords().subscribe(next => {
    logger.info(`[create skinRecord] ok ${JSON.stringify(next)}`);
}, error => {
    logger.error(`[create skinRecord] error ${JSON.stringify(error)}`);
});

function query(req, res, next) {
    let openId = req.method == 'POST' ? req.body.openId : req.query.openId;
    if (!openId) {
        logger.error(`openId is invalid ${openId}`);
        utils.writeHttpResponse(res, 601, `openId is invalid ${openId}`);
        return;
    }
    skinRecord.querySkinRecords(openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 600, 'error', error);
    })
}

router.get('/query', query).post('/query', query);

module.exports = router;