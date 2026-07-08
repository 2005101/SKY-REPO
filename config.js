require('dotenv').config();

global.APIs = {
    xteam: 'https://api.xteam.xyz',
    dzx: 'https://api.dhamzxploit.my.id',
    lol: 'https://api.lolhuman.xyz',
    violetics: 'https://violetics.pw',
    neoxr: 'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    akuari: 'https://api.akuari.my.id',
    akuari2: 'https://apimu.my.id',
    nrtm: 'https://fg-nrtm.ddns.net',
    bg: 'http://bochil.ddns.net',
    fgmods: 'https://api-fgmods.ddns.net'
};

global.APIKeys = {
    'https://api.xteam.xyz': 'd90a9e986e18778b',
    'https://api.lolhuman.xyz': '85faf717d0545d14074659ad',
    'https://api.neoxr.my.id': 'yourkey',
    'https://violetics.pw': 'beta',
    'https://zenzapis.xyz': 'yourkey',
    'https://api-fgmods.ddns.net': 'fg-dylux'
};

// DARK-EYE V3 Global Settings
global.packname = 'DARK-EYE V3'
global.author = 'DARK-EYE OFC'
global.prefix = '.'
global.owner = ['263783546271'] // put your number here with country code
global.sudo = ['263717400463'] // add sudo numbers here
global.botName = 'DARK-EYE V3'
global.sessionName = 'darkeye_session'
global.welcome = true
global.goodbye = true
global.anticall = false
global.autoread = false
global.autotyping = false

module.exports = {
    WARN_COUNT: 3,
    APIs: global.APIs,
    APIKeys: global.APIKeys,
    OWNER: global.owner,
    SUDO: global.sudo,
    BOTNAME: global.botName,
    PREFIX: global.prefix
};
