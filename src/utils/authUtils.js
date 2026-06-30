const bcrypt = require('bcrypt');

// jo abhi ke abhi execute ho raha hai usse wrap krdo ek function mein

async function hashPasswd(password){
    return await bcrypt.hash(password,10);
}

async function comparePasswd(password,hashPassword){
    return await bcrypt.compare(password,hashPassword);
}

const reservedWordsAliases = [
    "login",
    "signup",
    "urls",
    "myurls",
    "analytics",
    "auth"
]

module.exports = {
    hashPasswd,
    comparePasswd,
    reservedWordsAliases
};