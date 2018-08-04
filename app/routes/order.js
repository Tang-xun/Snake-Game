var express = require('express');
var router = express.Router();
var order = require('../db/snakeOrder');
var dao = require('../db/daoBean');
var logger = require('../logger').logger('route', 'info');
var utils = require('../util/comUtils');

order.createOrderTable().subscribe(next => {
    logger.info(`[create order] ok ${JSON.stringify(next)}`);
}, error => {
    logger.error(`[create order] error ${JSON.stringify(error)}`);
});

var queryOrder = function (req, res, next) {
    logger.info(`route queryOrder`);
    var openId = req.param('openId');
    var orderId = req.param('orderId');
    order.queryOrder(orderId, openId).subscribe(next => {
        logger.info(`query next ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        logger.info(`query error ${JSON.stringify(error)}`);
        utils.writeHttpResponse(res, 601, error);
    });
}

var updatePayment = function (req, res, next) {
    logger.info(`route updatePayment`);
    var orderId = req.param('orderId');
    var state = req.param('state');

    if (state > 0 && state > 4) {
        logger.info(`params check error}`);
        utils.writeHttpResponse(res, 601, `error order state ${JSON.stringify(state)}`);
        return;
    }

    order.updateOrderState(orderId, state).subscribe(next => {
        logger.info(`update next ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        logger.info(`update next ${JSON.stringify(error)}`);
        utils.writeHttpResponse(res, 601, error);
    });
}

var queryOrderList = function (req, res, next) {
    logger.info(`route queryOrderList`);
    order.queryOrderList(openId).subscribe(next => {
        logger.info(`query next ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        logger.info(`query error ${JSON.stringify(error)}`);
        utils.writeHttpResponse(res, 601, error);
    });

}
var addOrder = function (req, res, next) {
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
        logger.info(`add order ok ${JSON.stringify(next)}`);
        utils.writeHttpResponse(res, 200, next);
    }, error => {
        logger.info(`add order error ${JSON.stringify(error)}`);
        utils.writeHttpResponse(res, 601, error);
    });
}

router.get('/add', addOrder).post('/add', addOrder);

router.get('/query', queryOrder).post('/query', queryOrder);

router.get('/list', queryOrderList).post('/list', queryOrderList);

router.get('/update', updatePayment).post('/update', updatePayment);

module.exports = router;