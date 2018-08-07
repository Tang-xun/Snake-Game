const express = require('express');
const order = require('../db/snakeOrder');
const dao = require('../db/daoBean');
const logger = require('../logger').logger('route', 'info');
const utils = require('../util/comUtils');

let router = express.Router();

order.createOrderTable().subscribe(next => {
    logger.info(`[create order] ok ${JSON.stringify(next)}`);
}, error => {
    logger.error(`[create order] error ${JSON.stringify(error)}`);
});

function queryOrder (req, res, next) {
    logger.info(`route queryOrder`);
    let openId = req.param('openId');
    let orderId = req.param('orderId');
    order.queryOrder(orderId, openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next[0]);
    }, error => {
        utils.writeHttpResponse(res, 601, 'error', error);
    });
}

function updatePayment (req, res, next) {
    logger.info(`route updatePayment`);
    let orderId = req.param('orderId');
    let state = req.param('state');

    if (state > 0 && state > 4) {
        logger.info(`params check error}`);
        utils.writeHttpResponse(res, 601, `error order state ${state}`);
        return;
    }

    order.updateOrderState(orderId, state).subscribe(next => {
        if (next) {
            utils.writeHttpResponse(res, 200, 'ok');
        } else {
            utils.writeHttpResponse(res, 602, 'noting need to update');
        }
    }, error => {
        utils.writeHttpResponse(res, 601, error);
    });
}

function queryOrderList (req, res, next) {
    logger.info(`route queryOrderList`);
    let openId = req.param('openId');
    order.queryListOrder(openId).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        utils.writeHttpResponse(res, 601,'query error', error);
    });

}
function addOrder (req, res, next) {
    logger.info(`route addOrder`);
    let bean = new dao.Order();
    bean.openId = req.param('openId');
    bean.orderId = req.param('orderId');
    bean.productId = req.param('productId');
    bean.productName = req.param('productName');
    bean.productDesc = req.param('productDesc');
    bean.productPrice = req.param('productPrice');
    bean.productNum = req.param('productNum');
    bean.orderState = 0;
    bean.discount = req.param('discount');
    bean.totalPrice = req.param('totalPrice');

    order.createOrder(bean).subscribe(next => {
        utils.writeHttpResponse(res, 200, 'ok', next);
    }, error => {
        if (error.errno == 1062) {
            utils.writeHttpResponse(res, 602, 'order has bean add');
        } else {
            utils.writeHttpResponse(res, 601, 'error', error);
        }

    });
}

router.get('/add', addOrder).post('/add', addOrder);

router.get('/query', queryOrder).post('/query', queryOrder);

router.get('/list', queryOrderList).post('/list', queryOrderList);

router.get('/update', updatePayment).post('/update', updatePayment);

module.exports = router;