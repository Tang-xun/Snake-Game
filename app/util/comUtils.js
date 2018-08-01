var writeHttpResponse = function(res, code, msg) {
    res.writeHead(code, { 'Content-Type': 'text/plain' });
    res.write(`{
        code:${code},
        msg:${msg}
    }`);
    res.end();
}

var writeHttpResponse = function(res, code, msg, data) {
    res.writeHead(code, { 'Content-Type': 'text/plain' });
    res.write(`{
        code:${code},
        msg:${msg},
        data:${data}
    }`);
    res.end();
}

module.exports = {
    writeHttpResponse,
}