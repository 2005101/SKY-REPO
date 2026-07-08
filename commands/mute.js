const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function muteCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const cmd = text.split(' ')[0].toLowerCase();
        const metadata = await sock.groupMetadata(chatId);
        const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // 1. Check if in group
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', '*This command only works in groups*')
            }, { quoted: message });
        }

        // 2. Check if sender is admin
        if (!groupAdmins.includes(senderId)) {
            return await sock.sendMessage(chatId, {
                text: box('NO ACCESS', '*Only group admins can use this*')
            }, { quoted: message });
        }

        // 3. Check if bot is admin
        if (!groupAdmins.includes(botId)) {
            return await sock.sendMessage(chatId, {
                text: box('NO ACCESS', '*Make me admin first*')
            }, { quoted: message });
        }

        //.mute /.close /.lock = close group
        if (cmd === '.mute' || cmd === '.close' || cmd === '.lock') {
            await sock.groupSettingUpdate(chatId, 'announcement');
            return await sock.sendMessage(chatId, {
                text: box('GROUP LOCKED', `🚫 *Group is now closed*\n\nOnly admins can send messages`)
            }, { quoted: message });
        }

        //.unmute /.open /.unlock = open group
        if (cmd === '.unmute' || cmd === '.open' || cmd === '.unlock') {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            return await sock.sendMessage(chatId, {
                text: box('GROUP OPENED', `✅ *Group is now open*\n\nEveryone can send messages`)
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE mute:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to update group settings*')
        }, { quoted: message });
    }
}

module.exports = { muteCommand };
