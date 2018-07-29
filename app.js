var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');

var app = new express();

// router 
var indexRoute = require('./routes/index');
var userRoute = require('./routes/users');
var gradeRoute = require('./routes/grade');
var historyRoute = require('./routes/history');


// log4js
var log4js = require('./app/logger');
var logger = log4js.logger('app', 'info');

// 设置视图
function setupView() {
    logger.info(`init view`);

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
}

// 设置日志
function setupLog() {
    log4js.use(app);
}

// 设置路由模块
function setupRouter() {
    logger.info(`init router  `);
    app.use('/', indexRoute);
    app.use('/user', userRoute);
    app.use('/grade', gradeRoute);
    app.use('/history', historyRoute);
}



function setupServerError() {
    logger.info(`init server error handler  `);
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
    logger.info(`init base midWare  `);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
}

function onProcessExit() {
    // setup process exit listener;
    process.on('exit', function (code) {
        logger.info(`[Event|app exit] exit code is ${code}`);
        console.trace();
    });
}

function init() {
    logger.info(`init start `);
    app.locals.title = 'Sanke_Server';
    app.locals.email = 'tangxun_123@163.com';
    setupView();
    setupLog();
    setupBaseMidWare();
    setupRouter();
    setupServerError();
    onProcessExit();
}

function serverStart() {
    init();
    var server = http.createServer(app).listen(8000, function () {
        var host = server.address().address;
        var port = server.address().port;
        logger.info(`[Event|app start] ${app.locals.title} listened on ${host}:${port}`);
    });
}

serverStart();

module.exports = app;