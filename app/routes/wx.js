const express = require('express');
const http = require('https');
const rx = require('rx');

const utils = require('../util/comUtils');
const config = require('../config');
const logger = require('../logger').logger('wx', 'info');

let route = express.Router();

function code2AccessToken (req, res, next) {
    let code = req.body.code;
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
                if (data.errcode) {
                    utils.writeHttpResponse(res, 600, 'error', data);
                } else {
                    utils.writeHttpResponse(res, 200, 'ok', data);
                }
            });
        }, error => {
            logger.info(`error ${JSON.stringify(error)}`);
            utils.writeHttpResponse(res, 600, 'error', error);
        }, complete => {
            logger.info('complete');
        }
    )
}

route.get('/accessToken', code2AccessToken).post('/accessToken', code2AccessToken);

module.exports = route;