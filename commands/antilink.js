const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/antilink.json');
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

// List of links to detect
const linkRegex = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me|tiktok\.com|instagram\.com|facebook\.com|youtube\.com|twitter\.com|t\.me)/i;
const waGroupRegex = /(https?:\/\/)?(www\.)?chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})/i;

async function handleAntilinkCommand(sock, chatId, text, senderId, isSenderAdmin, message) {
    const isOwnerOrSudo = message.key.fromMe;
    if (!isOwnerOrSudo &&!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text: box('PERMISSION', '```Only Admins/Owner Can Use This!```')
        }, { quoted: message });
    }

    const action = text.split(' ')[1]?.toLowerCase();

    if (!db[chatId]) db[chatId] = { enabled: false };

    if (action === 'on') {
        db[chatId].enabled = true;
        saveDB();
        await sock.sendMessage(chatId, {
            text: box('ANTI-LINK', '✅ *ANTI-LINK ENABLED*\n\nAny links sent will be deleted and user will be kicked.')
        }, { quoted: message });
    }
    else if (action === 'off') {
        db[chatId].enabled = false;
        saveDB();
        await sock.sendMessage(chatId, {
            text: box('ANTI-LINK', '❌ *ANTI-LINK DISABLED*')
        }, { quoted: message });
    }
    else {
        await sock.sendMessage(chatId, {
            text: box('ANTI-LINK', `*Usage:*\n.antilink on - Enable\n.antilink off - Disable\n*Status:* ${db[chatId].enabled? 'ON ✅' : 'OFF ❌'}`)
        }, { quoted: message });
    }
}

// Auto detection middleware
async function Antilink(message, sock) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return; // only groups

    if (!db[chatId]?.enabled) return;

    const msg = message.message?.conversation ||
                message.message?.extendedTextMessage?.text ||
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption || '';

    if (!msg) return;
    if (!linkRegex.test(msg)) return;

    const senderId = message.key.participant;
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // Check if bot is admin
    const groupMetadata = await sock.groupMetadata(chatId);
    const botMember = groupMetadata.participants.find(p => p.id === botId);
    if (!botMember?.admin) return;

    // Check if sender is admin
    const senderMember = groupMetadata.participants.find(p => p.id === senderId);
    if (senderMember?.admin) return; // don't kick admins

    // Get group invite link to allow own group link
    let groupLink = '';
    try {
        const code = await sock.groupInviteCode(chatId);
        groupLink = `chat.whatsapp.com/${code}`;
    } catch {}

    // If message contains own group link, allow it
    if (msg.includes(groupLink)) return;

    // Delete the message
    try {
        await sock.sendMessage(chatId, { delete: message.key });
    } catch {}

    // Kick user
    try {
        await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
        await sock.sendMessage(chatId, {
            text: box('ANTI-LINK', `*USER KICKED* 👁️\n\n@${senderId.split('@')[0]} sent a link and was removed.`, { mentions: [senderId] })
        });
    } catch (e) {
        console.log('Antilink kick error:', e);
    }
}

module.exports = {
    handleAntilinkCommand,
    Antilink
};
