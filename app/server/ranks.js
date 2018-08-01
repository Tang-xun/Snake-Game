var schedule = require('node-schedule');
var RX = require('rxjs');

function scheduleRanks() {
    var rule = new schedule.RecurrenceRule();

    rule.second = 1;

    schedule.scheduleJob(rule, () => {
        console.log('schedule task next' + new Date());
    });
}

scheduleRanks();