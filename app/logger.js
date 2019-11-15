const log4js = require('log4js');

levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL
};

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        access: {
            type: 'dateFile',
            filename: 'logs/access/access-',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        info: {
            type: 'dateFile',
            filename: 'logs/info/app-',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        }
    },
    categories: { default: { appenders: ['info'], level: 'info' }, access: { appenders: ['access'], level: 'info' } }
});

exports.logger = function (name, level) {
    let logger = log4js.getLogger(name);
    logger.level = level;
    return logger;
};

exports.use = function (app) {
    //加载中间件
    app.use(log4js.connectLogger(log4js.getLogger('access'), {
        level: log4js.levels.INFO,
        format: ':method :url :status :response-time ms'

        //格式化http相关信息
        // format: `[${process.title}] :remote-addr - :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] :response-time ms`
    }));
};
