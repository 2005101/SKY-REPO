const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function kickCommand(sock, chatId, message, senderId) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants;
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];

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
                text: box('NO ACCESS', '*Make me admin first to kick people*')
            }, { quoted: message });
        }

        // 4. Check if user mentioned
        if (!target) {
            return await sock.sendMessage(chatId, {
                text: box('KICK', `*Usage:*.kick @user\n*Example:*.kick @John`)
            }, { quoted: message });
        }

        // 5. Prevent kicking owner/admins
        if (target === settings.owner + '@s.whatsapp.net') {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', '*Cannot kick bot owner*')
            }, { quoted: message });
        }
        if (groupAdmins.includes(target)) {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', '*Cannot kick another admin*')
            }, { quoted: message });
        }

        // 6. Kick
        await sock.groupParticipantsUpdate(chatId, [target], 'remove');

        await sock.sendMessage(chatId, {
            text: box('MEMBER KICKED', `🚪 @${target.split('@')[0]} has been removed`),
            mentions: [target]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE kick:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to kick user*')
        }, { quoted: message });
    }
}

module.exports = { kickCommand };
