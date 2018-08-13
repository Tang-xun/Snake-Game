let user =  require('../db/snakeUser');

let history = require('../db/snakeHistory');

let logger = require('../logger').logger('user-manager', 'info');


function updateUserHonor(userBean, honorBean) {
    console.log(userBean);
    console.log(changeBean);
    let keys = Object.keys(changeBean);
    let usefulKeys = keys.filter(key => changeBean[key] != undefined);
    usefulKeys.forEach(key => {
        user[key] = changeBean[key];
    });
}

function updateUserHistroy(userBean, historyBean) {
}


updateUserHonor(user, changeBean);

