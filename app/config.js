function now(){
    return new Date().toLocaleTimeString();
}

let appid = 'wx37723f213a3a9042';
let secret = 'eec5c27d58f5379c350bbc6883766d5c';
let grant_type='authorization_code';

module.exports = {
    now,
    appid,
    secret,
    grant_type,
}


