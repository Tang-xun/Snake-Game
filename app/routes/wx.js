const express = require('express');
const http = require('https');
const rx = require('rx');
const querystring = require('querystring');

const utils = require('../util/comUtils');
const config = require('../config');
const logger = require('../logger').logger('wx', 'info');

let route = express.Router();

function code2AccessToken(req, res, next) {
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

function queryBalance(req, res, next) {
    logger.info(`queryBalance ${req} ${res}`);
    let openId = req.body.openId;
    let accessToken = req.body.accessToken;

    let content = querystring.stringify({
        openid: openId,
        appid: config.appid,
        offer_id: "12345678",
        ts: "1507530737",
        zone_id: "1",
        pf: "android",
        sig: "d1f0a41272f9b85618361323e1b19cd8cb0213f21b935aeaa39c160892031e97",
        mp_sig: "ff4c5bb39dea1002a8f03be0438724e1a8bcea5ebce8f221f9b9fea3bcf3bf76"
    });

    let options = {
        host: 'api.weixin.qq.com',
        protocol: 'https:',
        port: 443,
        path: '/cgi-bin/midas/sandbox/getbalance?access_token=accessToken',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content)
        }
    };
    let request = http.request(options, function (resp) {
        let data = '';
        resp.on('data', (chunk) => {
            logger.info(`on data ${chunk}`);
            data += chunk;
        });
        resp.on('end', () => {
            data = JSON.parse(data);
            logger.info(`on end : ${JSON.stringify(data)}`);
            if (data.errcode) {
                utils.writeHttpResponse(res, 600, 'query Balance error', data);
            } else {
                utils.writeHttpResponse(res, 200, 'ok', data);
            }
        })
    });
    logger.info(request);
    request.write(content);
    request.end();
}

route.get('/accessToken', code2AccessToken).post('/accessToken', code2AccessToken);
route.get('/balance', queryBalance).post('/balance', queryBalance);

module.exports = route;