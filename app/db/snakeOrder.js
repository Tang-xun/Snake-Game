var db = require('./mysqlPool');
var RX = require('rxjs');
var dao = require('domain');


/**
 * 
 */
var createOrderTable = function () {
    let createSql = `create table snake.order (
        id int NOT NULL auto_increment,
        openId int NOT NULL COMMENT 'player id',
        orderId int NOT NULL COMMENT 'gen by sys',
        productId int NOT NULL COMMENT 'product id',
        productName int NOT NULL COMMENT 'product name',
        productDesc varchar(256) NOT NULL COMMENT 'product desc',
        productPrice float NOT NULL COMMENT 'product price',
        productNum int NOT NULL COMMENT 'product num',
        orderState int NOT NULL COMMENT 'order state',
        discount float NOT NULL COMMENT 'sale price',
        totalPrice float NOT NULL COMMENT 'product total price',
        createTime TIMESTAMP NOT NULL COMMENT 'create order time',
        paymentTime TIMESTAMP DEFAULT null COMMENT 'pay time',
        INDEX(orderId, openId, productId),
        UNIQUE(orderId),
        PRIMARY key(id,orderId)
    ) COMMENT 'order table' ,
    ENGINE=InnoDB DEFAULT CHARSET=UTF8MB3;`;

    return RX.bindCallback(db.query)(createSql);
}

/**
 * @param {*} orderId 
 * @param {*} openId 
 */
var queryOrder = function (orderId, openId) {
    let querySql = `select * from snake.order where snake.orderId=${orderId} and snake.opendId=${openId};`;
    return RX.bindCallback(db.query)(querySql);
}

/**
 * @param {*} openId 
 */
var queryListOrder = function (openId) {
    let querySql = `select * from snake.order where snake.opendId=${openId};`;
    return RX.bindCallback(db.query)(querySql);
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
            totalPrice,
            createTime,
            paymentTime)
        values(
            ${order.openId},
            ${order.orderId},
            ${order.productId},
            ${order.productName},
            ${order.productDesc},
            ${order.productPrice},
            ${order.productNum},
            ${order.orderState},
            ${order.discount},
            ${order.totalPrice},
        );`;
    return RX.bindCallback(db.query)(addSql);
}

/**
 * @param {*} orderId 
 * @param {*} state 
 */
var updateOrderState = function (orderId, state) {
    let updateSql = `update snake.order set order.state=${state} where orderId=${orderId}`;
    return RX.bindCallback(db.query)(updateSql);
}

module.exports = {
    createOrderTable,
    createOrder,
    queryOrder,
    queryListOrder,
    updateOrderState,
}