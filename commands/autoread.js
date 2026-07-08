const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function autoreadCommand(sock, chatId, message, senderId) {
    try {
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
                text: box('AUTO-READ', `*DARK-EYE V3 AUTO-READ*\n\n*Usage:*\n.autoread on - Enable auto read\n.autoread off - Disable auto read\n\n*Current Status:* ${settings.autoread? 'ON ✅' : 'OFF ❌'}`)
            }, { quoted: message });
        }

        if (args === 'on') {
            settings.autoread = true;
            await sock.sendMessage(chatId, {
                text: box('AUTO-READ', '✅ *AUTO-READ ENABLED*\n\nDARK-EYE V3 will now auto-read all messages, status, and chats.')
            }, { quoted: message });
        }
        else if (args === 'off') {
            settings.autoread = false;
            await sock.sendMessage(chatId, {
                text: box('AUTO-READ', '❌ *AUTO-READ DISABLED*\n\nMessages will stay unread until you open them.')
            }, { quoted: message });
        }
        else {
            await sock.sendMessage(chatId, {
                text: box('AUTO-READ', 'Invalid option.\nUse: `.autoread on` or `.autoread off`')
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE autoread command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Error processing autoread command*')
        }, { quoted: message });
    }
}

// Middleware to auto read messages
async function autoReadHandler(sock, message) {
    if (!settings.autoread) return;

    try {
        const chatId = message.key.remoteJid;
        // Mark chat as read
        await sock.readMessages([message.key]);
    } catch (e) {
        console.log('Autoread error:', e);
    }
}

// Auto read status
async function autoReadStatus(sock, statusData) {
    if (!settings.autoread) return;

    try {
        for (let status of statusData) {
            await sock.readMessages([status.key]);
        }
    } catch (e) {
        console.log('Auto status read error:', e);
    }
}

module.exports = { autoreadCommand, autoReadHandler, autoReadStatus };
