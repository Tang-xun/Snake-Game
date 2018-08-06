
var rankServer = require('../server/rankServer');
var logger = require('../logger').logger('utils', 'info');
var rx = require('rx');
var writeHttpResponse = function (res, code, msg, data) {
    res.writeHead(code, { 'Content-Type': 'text/plain' });
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
            error=>{
                return rx.Observable.just(100);
            }
        )
}

var isInvalid = function (data) {
    logger.debug(`isInvalid ${data}`);
    return data == 'undefined' || data == null || (typeof (data) == 'number' && isNaN(data)) || data == '';
}

module.exports = {
    isInvalid,
    calUserRanks,
    writeHttpResponse,
}