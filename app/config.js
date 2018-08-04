var now = function(){
    return new Date().toLocaleTimeString();
}

let appid = '00001';
let secret = '';
let grant_type='authorization_code';


module.exports = {
    now,
    appid,
    secret,
    grant_type,
}


