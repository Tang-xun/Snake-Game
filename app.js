/**
 * @description app global entrance 
 * @author tank
 */
var FileStreamRotator = require('file-stream-rotator')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var config = require('./src/config');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

process.title = 'Snake-Server';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// define logger midWare
var logDirs = path.join(__dirname, 'logs');
fs.existsSync(logDirs) || fs.mkdirSync(logDirs);
var accLogStream = FileStreamRotator.getStream({
    date_format : 'YYYY-MM-DD',
    filename: path.join(logDirs, 'access-%DATE%.log'),
    frequency:'daily',
    verbose: false
});
morgan.format('snake',`[${process.title}] :remote-addr - :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] :response-time ms`);
app.use(morgan('snake', {stream: accLogStream}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// define router 
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// setup process exit listener;
process.on('exit', function(code){
  console.debug(`${config.now()} [Event | app exit] exit code is ${code}`);
  console.trace();
});

// set app listen on
var server = app.listen(8000, function() {
    var host = server.address().address;
    var port  = server.address().port;
    console.debug(`${config.now()} [Event | app start] ${process.title} listened on ${host}:${port}`);
});

module.exports = app;
