
var rankServer = require('../server/rankServer');
var logger = require('../logger').logger('utils', 'info');
var rx = require('rx');

var writeHttpResponse = function (res, code, msg, data) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.write(`{`);
    res.write(`"code": ${code}, "msg": "${msg}"`);
    if (data) res.write(`,"data": ${data}`);
    res.write(`}`);
    res.end();
}

var calUserRanks = function (score) {
    logger.info(`calUserRanks start ${score}`);
    var rankScore = rankServer.ServerConfig.rankScore;
    return rx.Observable.from(rankScore)
        .first(it => it.score <= score)
        .map(it => parseFloat(it.ranks / 20) * 100).doOnError(
            error => {
                return rx.Observable.just(100);
            }
        )
}

var isInvalid = function (data) {
    logger.debug(`isInvalid ${data}`);
    return data == 'undefined' || data == null || (typeof (data) == 'number' && isNaN(data)) || data == '';
}

function checkParams(bean) {
    rx.Observable.zip(
        rx.Observable.from(Object.keys(bean)),
        rx.Observable.from(Object.values(bean)))
        .find(it => it[1] == 'undefined')
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
    calUserRanks,
    checkParams,
    writeHttpResponse,
}