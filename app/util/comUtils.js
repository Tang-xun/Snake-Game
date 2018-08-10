
const rankServer = require('../manager/rankManager');
const logger = require('../logger').logger('utils', 'info');
const rx = require('rx');

function writeHttpResponse(res, code, msg, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    let resObj = {
        'code': code,
        'msg': msg,
        'data': data
    };
    logger.info(`resObj ${JSON.stringify(resObj)}`);
    res.write(JSON.stringify(resObj));
    res.end();
}


function isInvalid(data) {
    logger.debug(`isInvalid ${data}`);
    return data == 'undefined' || data == null || (typeof (data) == 'number' && isNaN(data)) || data == '';
}

function checkParams(bean) {
    rx.Observable.zip(
        rx.Observable.from(Object.keys(bean)),
        rx.Observable.from(Object.values(bean)))
        .find(it => it[1] == undefined)
        .find(it => typeof (it[1]) == 'number' && isNaN(it[1]))
        .subscribe(
            next => {
                logger.info(`next ：${next}`);
            }, error => {
                logger.info(`error ：${error}`);
            }, () => {
                logger.info(`complete `);
            }
        )
}

module.exports = {
    isInvalid,
    checkParams,
    writeHttpResponse,
}