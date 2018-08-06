var db = require('./mysqlPool');
var dao = require('domain');

var logger = require('../logger').logger('snakeOrder', 'info');
/**
 * 
 */
var createOrderTable = function () {
    let createSql = `CREATE TABLE IF NOT EXISTS snake.order (
        id int NOT NULL auto_increment,
        openId varchar(256) NULL COMMENT 'player id',
        orderId varchar(256) NOT NULL COMMENT 'gen by sys',
        productId varchar(256) NOT NULL COMMENT 'product id',
        productName int NOT NULL COMMENT 'product name',
        productDesc varchar(256) NOT NULL COMMENT 'product desc',
        productPrice float NOT NULL COMMENT 'product price',
        productNum int NOT NULL COMMENT 'product num',
        orderState int NOT NULL COMMENT 'order state',
        discount float NOT NULL COMMENT 'sale price',
        totalPrice float NOT NULL COMMENT 'product total price',
        createTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create order time',
        paymentTime TIMESTAMP DEFAULT null COMMENT 'pay time',
        INDEX(orderId, openId, productId),
        UNIQUE(orderId),
        PRIMARY key(id,orderId)
    ) COMMENT 'order table' ,
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`;
    return db.rxQuery(createSql, null);
}

/**
 * @param {*} orderId 
 * @param {*} openId 
 */
var queryOrder = function (orderId, openId) {
    let querySql = `select * from snake.order where orderId='${orderId}' and openId='${openId}';`;
    logger.info(`will exec sql ${querySql}`);
    return db.rxQuery(querySql, null);
}

/**
 * @param {*} openId 
 */
var queryListOrder = function (openId) {
    let querySql = `select * from snake.order where openId='${openId}';`;
    return db.rxQuery(querySql, null);
}

/**
 * @param {*} order 
 */
var createOrder = function (order) {
    let addSql = `insert into snake.order (
            openId,
            orderId,
            productId,
            productName,
            productDesc,
            productPrice,
            productNum,
            orderState,
            discount,
            totalPrice)
        values(
            '${order.openId}',
            '${order.orderId}',
            '${order.productId}',
            ${order.productName},
            ${order.productDesc},
            ${order.productPrice},
            ${order.productNum},
            ${order.orderState},
            ${order.discount},
            ${order.totalPrice}
        );`;

    logger.info(`will exec sql ${addSql}`);
    return db.rxQuery(addSql, null);
}

/**
 * @param {*} orderId 
 * @param {*} state 
 */
var updateOrderState = function (orderId, state) {
    let updateSql = `update snake.order set order.orderState='${state}' where orderId='${orderId}'`;
    return db.rxQuery(updateSql, null).map(it => it.changedRows > 0);
}

module.exports = {
    createOrderTable,
    createOrder,
    queryOrder,
    queryListOrder,
    updateOrderState,
}