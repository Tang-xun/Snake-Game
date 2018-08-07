var express = require('express');
var route = express.Router();
var http = require('https');
var rx = require('rx');

var utils = require('../util/comUtils');
var config = require('../config');
var logger = require('../logger').logger('wx', 'info');

var code2AccessToken = function (req, res, next) {
    var code = req.param('code');
    logger.info(`code2AccessToken ${req.method} code:${code}`);
    if (utils.isInvalid(code)) {
        utils.writeHttpResponse(res, 600, 'code is invalid');
        return;
    }
    let url = 'https://api.weixin.qq.com/sns/jscode2session?'
    url += `appid=${config.appid}&`;
    url += `secret=${config.secret}&`;
    url += `js_code=${code}&`;
    url += 'grant_type=authorization_code';
    logger.info(`http ${url}`);

    rx.Observable.fromCallback(http.get)(url).subscribe(
        (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                logger.info(`on data ${chunk}`);
                data += chunk;
            });
            resp.on('end', () => {
                data = JSON.parse(data);
                logger.info(`on end : ${typeof (data)} ${JSON.stringify(data)}`);
                if (data.errcode == 0) {
                    utils.writeHttpResponse(res, 200, data);
                } else {
                    utils.writeHttpResponse(res, 600, data.errmsg);
                }
            });
        }, error => {
            logger.info(`error ${JSON.stringify(error)}`);
        }, complete => {
            logger.info('complete');
        }
    )
}

route.get('/accessToken', code2AccessToken).post('/accessToken', code2AccessToken);

module.exports = route;