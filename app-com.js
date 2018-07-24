var FileStreamRotator = require('file-stream-rotator')
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var express = require('express');
var morgan = require('morgan');
var https = require('https');
var http = require('http');
var path = require('path');
var fs = require('fs');

var config = require('./src/config');

var indexRoute = require('./routes/index');
var userRoute = require('./routes/users');
var gradeRoute = require('./routes/grade');

var log4js = require('./logger');

var logger = log4js.logger('app-com','info');

var app = new express();

// 设置视图
function setupView() {
    logger.info(`Tank ::: init view`);

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
}

// 设置日志
function setupLog() {
    log4js.use(app);
}

// 设置路由模块
function setupRouter() {
    logger.info(`Tank ::: init router  `);
    app.use('/', indexRoute);
    app.use('/users', userRoute);
    app.use('/grade', gradeRoute);
}

function setupServerError() {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

// 设置其他组件
function setupBaseMidWare() {
    logger.info(`Tank ::: init base midWare  `);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
}

function onProcessExit() {
    // setup process exit listener;
    process.on('exit', function (code) {
        logger.info(`[Event | app exit] exit code is ${code}`);
        console.trace();
    });
}

function init() {
    console.time('Tank ::: app init');
    logger.info(`Tank ::: init start `);
    app.locals.title = 'Sanke_Server';
    app.locals.email = 'tangxun_123@163.com';
    setupView();
    setupLog();
    setupBaseMidWare();
    setupRouter();
    setupServerError();
    onProcessExit();
    console.timeEnd('Tank ::: app init');
}

function start() {
    init();
    var server = http.createServer(app).listen(8000, function () {
        var host = server.address().address;
        var port = server.address().port;
        logger.info(`[Event | app start] ${app.locals.title} listened on ${host}:${port}`);
    });
}

start();

module.exports = app;