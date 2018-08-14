const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const coreServer = require('./app/manager/rankManager');

const rx = require('rx');

let app = new express();

// router 
const wxRoute = require('./app/routes/wx');
const indexRoute = require('./app/routes/index');
const userRoute = require('./app/routes/user');
const gradeRoute = require('./app/routes/grade');
const orderRoute = require('./app/routes/order');
const honorRoute = require('./app/routes/honor');
const historyRoute = require('./app/routes/history');
const userHonor = require('./app/routes/userHonor');
const skinRecord = require('./app/routes/skin');

// log4js
const log4js = require('./app/logger');
let logger = log4js.logger('app', 'info');

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
    logger.info(`init router`);

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        obj = req.method == 'POST' ? req.body : req.query;
        rx.Observable.zip(
            rx.Observable.from(Object.keys(obj)),
            rx.Observable.from(Object.values(obj)),
        ).subscribe(
            next => {
                logger.info(next);
            }, error => {
                logger.info(error);
            }
        )
        next();
    })
    app.use('/', indexRoute);
    app.use('/wx', wxRoute);
    app.use('/user', userRoute);
    app.use('/grade', gradeRoute);
    app.use('/order', orderRoute);
    app.use('/honor', honorRoute);
    app.use('/history', historyRoute);
    app.use('/userHonor', userHonor);
    app.use('/skin', skinRecord);
}



function setupServerError() {
    logger.info(`init server error handler`);
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
    logger.info(`init base midWare`);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
}

function onProcessExit() {
    // setup process exit listener;
    process.on('exit', function (code) {
        logger.info(`[Event|app exit] exit code is ${code}`);
        logger.trace();
    });

}

/**
 * start time task for user ranks
 */
function startCoreServer() {
    coreServer.rxFetchUserCount();
    coreServer.rxFetchRankScore();
    coreServer.rxRanksTimeTask();
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
    startCoreServer();
    onProcessExit();
    // setup env ['dev', 'prd'];
    process.env = 'dev';
}

function serverStart() {
    init();
    let server = http.createServer(app).listen(process.env == 'dev' ? 8000 : 80, function () {
        let host = server.address().address;
        let port = server.address().port;
        logger.info(`[Event|app start] ${app.locals.title} listened on ${host}:${port}`);
    });
}

serverStart();

module.exports = app;
