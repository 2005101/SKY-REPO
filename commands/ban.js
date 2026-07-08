const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/banned.json');
if (!fs.existsSync(path.join(__dirname, '../database'))) fs.mkdirSync(path.join(__dirname, '../database'));

// Load banned users
let bannedUsers = [];
if (fs.existsSync(dbPath)) {
    bannedUsers = JSON.parse(fs.readFileSync(dbPath));
}

function saveBanned() {
    fs.writeFileSync(dbPath, JSON.stringify(bannedUsers, null, 2));
}

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Check if user is banned
function isBanned(userId) {
    return bannedUsers.includes(userId);
}

async function banCommand(sock, chatId, message, args, senderId, settings) {
    const isOwnerOrSudo = message.key.fromMe || senderId === settings.owner?.[0] || settings.sudo?.includes(senderId);
    if (!isOwnerOrSudo) {
        return await sock.sendMessage(chatId, {
            text: box('PERMISSION', '```Only Bot Owner/Sudo Can Use This!```')
        }, { quoted: message });
    }

    const action = args.split(' ')[0]?.toLowerCase();
    const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                   args.split(' ')[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    if (!action ||!target) {
        return await sock.sendMessage(chatId, {
            text: box('BAN SYSTEM', `*DARK-EYE V3 BOT BAN*\n\n*Usage:*\n.ban add @user - Ban from using bot\n.ban remove @user - Unban\n.ban list - Show banned users\n\n*Note:* This only blocks bot usage, not WhatsApp.`)
        }, { quoted: message });
    }

    if (action === 'add') {
        if (bannedUsers.includes(target)) {
            return await sock.sendMessage(chatId, {
                text: box('BAN', `*${target.split('@')[0]} is already banned from using the bot.*`)
            }, { quoted: message, mentions: [target] });
        }
        bannedUsers.push(target);
        saveBanned();
        await sock.sendMessage(chatId, {
            text: box('BAN', `✅ *USER BANNED*\n\n@${target.split('@')[0]} can no longer use DARK-EYE V3 commands.`, { mentions: [target] })
        }, { quoted: message });
    }

    else if (action === 'remove') {
        if (!bannedUsers.includes(target)) {
            return await sock.sendMessage(chatId, {
                text: box('BAN', `*${target.split('@')[0]} is not banned.*`)
            }, { quoted: message, mentions: [target] });
        }
        bannedUsers = bannedUsers.filter(u => u!== target);
        saveBanned();
        await sock.sendMessage(chatId, {
            text: box('UNBAN', `✅ *USER UNBANNED*\n\n@${target.split('@')[0]} can now use DARK-EYE V3 commands again.`, { mentions: [target] })
        }, { quoted: message });
    }

    else if (action === 'list') {
        if (bannedUsers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: box('BAN LIST', '```No users are banned from the bot.```')
            }, { quoted: message });
        }
        let list = bannedUsers.map((u, i) => `${i+1}. @${u.split('@')[0]}`).join('\n');
        await sock.sendMessage(chatId, {
            text: box('BAN LIST', `*Banned Users:*\n${list}`),
            mentions: bannedUsers
        }, { quoted: message });
    }
}

// Middleware: Block banned users from using commands
function checkBan(userId) {
    return isBanned(userId);
}

module.exports = { banCommand, checkBan, isBanned };
