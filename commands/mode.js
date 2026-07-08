const settings = require('../settings');
const fs = require('fs');
const path = './settings.js';

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

function saveSettings() {
    const data = `module.exports = ${JSON.stringify(settings, null, 2)};`;
    fs.writeFileSync(path, data);
}

async function modeCommand(sock, chatId, message, senderId) {
    try {
        const ownerId = settings.owner + '@s.whatsapp.net';
        const { isSudo } = require('./sudo'); // if you have sudo.js

        // Only owner/sudo can change mode
        if (senderId!== ownerId &&!isSudo(senderId)) {
            return await sock.sendMessage(chatId, {
                text: box('MODE', '```Only owner/sudo can use this!```')
            }, { quoted: message });
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const arg = text.split(' ')[1]?.toLowerCase();

        if (!arg) {
            return await sock.sendMessage(chatId, {
                text: box('BOT MODE',
                    `*Current Mode:* ${settings.mode.toUpperCase()}\n\n` +
                    `*Usage:*\n` +
                    `.mode public - Anyone can use bot\n` +
                    `.mode private - Only owner/sudo can use bot`
                )
            }, { quoted: message });
        }

        if (arg === 'public') {
            settings.mode = 'public';
            saveSettings();
            await sock.sendMessage(chatId, {
                text: box('MODE CHANGED', '```Bot is now in PUBLIC MODE```\n\nEveryone can use commands')
            }, { quoted: message });

        } else if (arg === 'private') {
            settings.mode = 'private';
            saveSettings();
            await sock.sendMessage(chatId, {
                text: box('MODE CHANGED', '```Bot is now in PRIVATE MODE```\n\nOnly owner/sudo can use commands')
            }, { quoted: message });

        } else {
            await sock.sendMessage(chatId, {
                text: box('ERROR', '*Usage:*.mode public or .mode private')
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE mode command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to change mode*')
        }, { quoted: message });
    }
}

// Helper to check if command should run
function canUseBot(senderId) {
    const ownerId = settings.owner + '@s.whatsapp.net';
    const { isSudo } = require('./sudo');
    
    if (settings.mode === 'public') return true;
    return senderId === ownerId || isSudo(senderId);
}

module.exports = { modeCommand, canUseBot };
