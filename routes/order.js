var express = require('express');
var router = express.Router();
var order = require('../app/db/snakeOrder');
var dao = require('../app/db/daoBean');
var logger = require('../app/logger').logger('route', 'info');
var utils = require('../app/util/comUtils');

order.createOrderTable().subscribe(res => {
    if (res[0] != null) {
        logger.error(`[create order] error ${JSON.stringify(res[0])}`);
    } else {
        logger.info(`[create order] ok ${JSON.stringify(res[1])}`);
    }
});

var queryOrder = function (req, res, next) {
    logger.info(`route queryOrder`);
    var openId = req.param('openId');
    var orderId = req.param('orderId');
    order.queryOrder(orderId, openId).subscribe(query => {
        logger.info(`query next ${JSON.stringify(query)}`);
        if (query[0] != null) {
            utils.writeHttpResponse(res, 600, query[0]);
        } else {
            utils.writeHttpResponse(res, 200, query[1]);
        }
    });
}

var updatePayment = function (req, res, next) {
    logger.info(`route updatePayment`);
    var orderId = req.param('orderId');
    var state = req.param('state');

    if (state > 0 && state > 4) {
        utils.writeHttpResponse(res, 601, `error order state ${JSON.stringify(state)}`);
        return;
    }

    order.updateOrderState(orderId, state).subscribe(update => {
        logger.info(`update next ${JSON.stringify(update)}`);
        if (update[0] != null) {
            utils.writeHttpResponse(res, 600, update[0]);
        } else {
            utils.writeHttpResponse(res, 200, update[1]);
        }
    });
}

var queryOrderList = function (req, res, next) {
    logger.info(`route queryOrderList`);
    order.queryOrderList(openId).subscribe(query => {
        logger.info(`query next ${JSON.stringify(query)}`);
        if (query[0] != null) {
            utils.writeHttpResponse(res, 600, query[0]);
        } else {
            utils.writeHttpResponse(res, 200, query[1]);
        }
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
    order.createOrder(bean).subscribe(add => {
        logger.info(`add order ok ${JSON.stringify(add)}`);
        if (add[0] != null) {
            utils.writeHttpResponse(res, 200, add[0]);
        } else {
            utils.writeHttpResponse(res, 200, add[1]);
        }
    });
}

router.get('/add', addOrder).post('/add', addOrder);

router.get('/query', queryOrder).post('/query', queryOrder);

router.get('/list', queryOrderList).post('/list', queryOrderList);

router.get('/update', updatePayment).post('/update', updatePayment);

module.exports = router;