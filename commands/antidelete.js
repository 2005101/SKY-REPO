const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/antidelete.json');
if (!fs.existsSync(path.join(__dirname, '../database'))) fs.mkdirSync(path.join(__dirname, '../database'));

// Load DB
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

// Store messages in memory + file
const messageStore = new Map();

async function storeMessage(sock, message) {
    const chatId = message.key.remoteJid;
    const messageId = message.key.id;

    if (!messageStore.has(chatId)) messageStore.set(chatId, new Map());

    const content = message.message;
    const sender = message.key.participant || message.key.remoteJid;
    const timestamp = message.messageTimestamp;
    const mtype = Object.keys(content)[0];

    messageStore.get(chatId).set(messageId, {
        message: content,
        sender: sender,
        timestamp: timestamp,
        type: mtype,
        chat: chatId
    });

    // Auto delete from cache after 24h to save RAM
    setTimeout(() => {
        messageStore.get(chatId)?.delete(messageId);
    }, 24 * 60 * 60 * 1000);
}

// Handle message deletion
async function handleMessageRevocation(sock, message) {
    const chatId = message.key.remoteJid;
    const deletedMsgId = message.message.protocolMessage.key.id;

    if (!messageStore.has(chatId)) return;
    const deletedMsg = messageStore.get(chatId).get(deletedMsgId);
    if (!deletedMsg) return;

    const sender = deletedMsg.sender;
    const senderName = '@' + sender.split('@')[0];
    const time = new Date(deletedMsg.timestamp * 1000).toLocaleString();

    let caption = box('ANTI-DELETE',
`*DELETED MESSAGE DETECTED* 👁️

*From:* ${senderName}
*Time:* ${time}
*Chat:* ${chatId.endsWith('@g.us')? 'Group' : 'Private'}`);

    try {
        // Resend the deleted message
        await sock.sendMessage(chatId, {
            forward: deletedMsg.message,
           ...caption
        }, { quoted: message });

        // Send info box
        await sock.sendMessage(chatId, {
            text: caption,
            mentions: [sender]
        });
    } catch (e) {
        console.log('Anti-delete error:', e);
    }
}

// Toggle command
async function handleAntideleteCommand(sock, chatId, message, args) {
    const isOwnerOrSudo = message.key.fromMe;
    if (!isOwnerOrSudo) {
        return await sock.sendMessage(chatId, {
            text: box('PERMISSION', '```Only Bot Owner Can Use This!```')
        }, { quoted: message });
    }

    const action = args?.toLowerCase();

    if (!db[chatId]) db[chatId] = { enabled: false };

    if (action === 'on') {
        db[chatId].enabled = true;
        saveDB();
        await sock.sendMessage(chatId, {
            text: box('ANTI-DELETE', '✅ *ANTI-DELETE ENABLED*\n\nDARK-EYE V3 will now recover deleted messages.')
        }, { quoted: message });
    }
    else if (action === 'off') {
        db[chatId].enabled = false;
        saveDB();
        await sock.sendMessage(chatId, {
            text: box('ANTI-DELETE', '❌ *ANTI-DELETE DISABLED*')
        }, { quoted: message });
    }
    else {
        await sock.sendMessage(chatId, {
            text: box('ANTI-DELETE', `*Usage:*\n.antidelete on - Enable\n.antidelete off - Disable\n*Status:* ${db[chatId].enabled? 'ON ✅' : 'OFF ❌'}`)
        }, { quoted: message });
    }
}

// Middleware to check if antidelete is enabled
function isAntiDeleteEnabled(chatId) {
    return db[chatId]?.enabled === true;
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage,
    isAntiDeleteEnabled
};
