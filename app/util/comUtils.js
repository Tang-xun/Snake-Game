var rankServer = require('../server/rankServer');
var logger = require('../logger').logger('utils', 'info');
var rx = require('rx');
var writeHttpResponse = function(res, code, msg) {
    res.writeHead(code, { 'Content-Type': 'text/plain' });
    res.write(`{
        code:${code},
        msg:${msg}
    }`);
    res.end();
}

var calUserRanks = function(score) {
    var rankScore = rankServer.ServerConfig.rankScore;
    rx.Observable.from(rankScore).filter(it=>{
        return it.score > score;
    }).doOnNext(it=>{
        logger.info(`cal User ranks ${it}`);
    })
}

module.exports = {
    calUserRanks,
    writeHttpResponse,
}