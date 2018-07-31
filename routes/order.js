var express = require('express');
var router = express.Router();
var order = require('../app/db/snakeOrder');
var dao = require('../app/db/daoBean');
var logger = require('../app/logger').logger('order', 'infi');
var utils = require('../app/util/comUtils');

order.createOrderTable().subscribe(res => {
    if (res[0] != null) {
        logger.error(`create error ${JSON.stringify(res[0].sqlMessage)}`);
    } else {
        logger.info(`create ok ${JSON.stringify(res[1])}`);
    }
})

var queryOrder = function (req, res, next) {
    utils.writeHttpResponse(res, 200, 'query order ok');
    logger.info(`route queryOrder`);
}

var updatePayment = function (req, res, next) {
    utils.writeHttpResponse(res, 200, 'update Order ok');
    logger.info(`route updatePayment`);
}

var queryOrderList = function (req, res, next) {
    utils.writeHttpResponse(res, 200, 'query Order list ok');
    logger.info(`route queryOrderList`);
}
var addOrder = function (req, res, next) {
    utils.writeHttpResponse(res, 200, 'add order ok');
    logger.info(`route addOrder`);
}

router.post('/add', addOrder);

router.get('/query', queryOrder).post('/query', queryOrder);

router.get('/list', queryOrderList).post('/list', queryOrderList);

router.post('/update', updatePayment);

module.exports = router;