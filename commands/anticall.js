const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function anticallCommand(sock, chatId, message, senderId, isSenderAdmin) {
    try {
        // Only owner/sudo can use
        const isOwnerOrSudo = message.key.fromMe || senderId === settings.owner?.[0] || settings.sudo?.includes(senderId);
        if (!isOwnerOrSudo) {
            return await sock.sendMessage(chatId, {
                text: box('PERMISSION', '```Only Bot Owner/Sudo Can Use This!```')
            }, { quoted: message });
        }

        const text = message.message?.conversation ||
                    message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ')[1]?.toLowerCase();

        if (!args) {
            return await sock.sendMessage(chatId, {
                text: box('ANTI-CALL', `*DARK-EYE V3 ANTI-CALL*\n\n*Usage:*\n.anticall on - Enable anti-call\n.anticall off - Disable anti-call\n\n*Current Status:* ${settings.anticall? 'ON ✅' : 'OFF ❌'}`)
            }, { quoted: message });
        }

        if (args === 'on') {
            settings.anticall = true;
            await sock.sendMessage(chatId, {
                text: box('ANTI-CALL', '✅ *ANTI-CALL ENABLED*\n\nDARK-EYE V3 will now auto-reject all incoming calls and warn the caller.')
            }, { quoted: message });
        }
        else if (args === 'off') {
            settings.anticall = false;
            await sock.sendMessage(chatId, {
                text: box('ANTI-CALL', '❌ *ANTI-CALL DISABLED*\n\nDARK-EYE V3 will now accept calls normally.')
            }, { quoted: message });
        }
        else {
            await sock.sendMessage(chatId, {
                text: box('ANTI-CALL', 'Invalid option.\nUse: `.anticall on` or `.anticall off`')
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE anticall command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Error processing anticall command*')
        }, { quoted: message });
    }
}

module.exports = { anticallCommand };
