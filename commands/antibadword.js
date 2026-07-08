const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/antibadword.json');
if (!fs.existsSync(path.join(__dirname, '../database'))) fs.mkdirSync(path.join(__dirname, '../database'));

// Load or create DB
let db = {};
if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath));
}

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function handleAntiBadwordCommand(sock, chatId, message, action) {
    const groupId = chatId;
    if (!db[groupId]) db[groupId] = { enabled: false, words: [] };

    const args = action.toLowerCase().split(' ');
    const cmd = args[0];
    const word = args.slice(1).join(' ');

    if (cmd === 'on') {
        db[groupId].enabled = true;
        saveDB();
        return await sock.sendMessage(chatId, {
            text: box('ANTI-BADWORD', '✅ Anti-badword *ENABLED* for this group')
        }, { quoted: message });
    }
    if (cmd === 'off') {
        db[groupId].enabled = false;
        saveDB();
        return await sock.sendMessage(chatId, {
            text: box('ANTI-BADWORD', '❌ Anti-badword *DISABLED* for this group')
        }, { quoted: message });
    }
    if (cmd === 'add' && word) {
        if (!db[groupId].words.includes(word)) {
            db[groupId].words.push(word);
            saveDB();
        }
        return await sock.sendMessage(chatId, {
            text: box('ANTI-BADWORD', `✅ Added word: *${word}*\nTotal: ${db[groupId].words.length}`)
        }, { quoted: message });
    }
    if (cmd === 'del' && word) {
        db[groupId].words = db[groupId].words.filter(w => w!== word);
        saveDB();
        return await sock.sendMessage(chatId, {
            text: box('ANTI-BADWORD', `🗑️ Deleted word: *${word}*`)
        }, { quoted: message });
    }
    if (cmd === 'list') {
        const list = db[groupId].words.length > 0? db[groupId].words.join(', ') : 'No words added';
        return await sock.sendMessage(chatId, {
            text: box('BADWORD LIST', `Status: ${db[groupId].enabled? 'ON ✅' : 'OFF ❌'}\nWords: ${list}`)
        }, { quoted: message });
    }

    // Help
    const help = `*Usage:*
.antibadword on - Enable
.antibadword off - Disable
.antibadword add <word> - Add word
.antibadword del <word> - Delete word
.antibadword list - Show list`;
    return await sock.sendMessage(chatId, { text: box('ANTI-BADWORD', help) }, { quoted: message });
}

// Middleware to check messages
async function checkBadword(sock, message) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return false;
    if (!db[chatId] ||!db[chatId].enabled) return false;

    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const lowerText = text.toLowerCase();

    for (let word of db[chatId].words) {
        if (lowerText.includes(word.toLowerCase())) {
            // Delete message and warn
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.sendMessage(chatId, {
                text: box('WARNING', `⚠️ @${message.key.participant.split('@')[0]} No badwords allowed!\nWord: *${word}*`),
                mentions: [message.key.participant]
            });
            return true;
        }
    }
    return false;
}

module.exports = { handleAntiBadwordCommand, checkBadword };
