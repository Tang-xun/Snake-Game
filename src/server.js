var http = require('http');

var url = require('url');

function  start() {

    var server  = app.listen(8000, function() {
        var host = server.address().address;
        var port  = server.address().port;
        console.debug(`${config.now()} [Event | app start] ${process.title} listened on ${host}:${port}`);
    });
}

module.exports = {
    start,
}