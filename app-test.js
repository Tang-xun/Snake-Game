var dao = require('./app/db/daoBean');

var history = new dao.History();

console.info(`history ::: ${JSON.stringify(history)}`);