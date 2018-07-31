var writeHttpResponse = function(res, code, msg) {
    res.writeHead(code, { 'Content-Type': 'text/plain' });
    res.write(`{
        code:${code},
        msg:${msg}
    }`);
    res.end();
}

module.exports = {
    writeHttpResponse,
}