let user =  require('../db/snakeUser');

let history = require('../db/snakeHistory');

let logger = require('../logger').logger('user-manager', 'info');

function compareChanage(userBean, changeBean) {
    logger.info(userBean);
    logger.info(changeBean);
    let keys = Object.keys(changeBean);
    let usefulKeys = keys.filter(key => changeBean[key] != undefined);
    usefulKeys.forEach(key => {
        userBean[key] = changeBean[key];
    });
}

function updateUserHonor(userBean, honorBean) {
    logger.info(`updateUserHonor ${userBean} ${honorBean}`);
    compareChanage(userBean, changeBean);
}

function updateUserHistroy(userBean, historyBean) {
    logger.info(`updateUserHonor ${userBean} ${historyBean}`);
    // time model
    if (!historyBean.gameType) {
        // time model
        if (historyBean.length > userBean.t_length) userBean.t_length = historyBean.length;
        if (historyBean.bestKill > userBean.t_bestKill) userBean.t_bestKill = historyBean.bestKill;
        if (historyBean.linkKill > userBean.t_linkKill) userBean.t_linkKill = historyBean.linkKill;
        if (historyBean.liveTime > userBean.liveTime) userBean.liveTime = historyBean.liveTime;
    } else {
        // endless model
        if (historyBean.length > userBean.e_length) userBean.e_length = historyBean.length;
        if (historyBean.bestKill > userBean.e_bestKill) userBean.e_bestKill = historyBean.bestKill;
        if (historyBean.linkKill > userBean.e_linkKill) userBean.e_linkKill = historyBean.linkKill;
        if (historyBean.liveTime > userBean.liveTime) userBean.liveTime = historyBean.liveTime;
    }
}

module.exports = {
    updateUserHonor,
    updateUserHistroy,
}

