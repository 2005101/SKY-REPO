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

async function sudoCommand(sock, chatId, message, senderId) {
    try {
        const ownerId = settings.owner + '@s.whatsapp.net';

        // Only owner can manage sudo
        if (senderId!== ownerId) {
            return await sock.sendMessage(chatId, {
                text: box('SUDO', '```Only bot owner can use this command!```')
            }, { quoted: message });
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        const action = args[0];
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[1];

        if (!action ||!target) {
            let list = settings.sudo.map(jid => `• @${jid.split('@')[0]}`).join('\n') || 'None';
            return await sock.sendMessage(chatId, {
                text: box('SUDO MENU',
                    `*Usage:*\n` +
                    `.sudo add @user\n` +
                    `.sudo del @user\n` +
                    `.sudo list\n\n` +
                    `*Current Sudo Users:*\n${list}`
                ),
                mentions: settings.sudo
            }, { quoted: message });
        }

        if (action === 'add') {
            if (settings.sudo.includes(target)) {
                return await sock.sendMessage(chatId, {
                    text: box('SUDO', `*@${target.split('@')[0]} is already a sudo user*`),
                    mentions: [target]
                }, { quoted: message });
            }
            settings.sudo.push(target);
            saveSettings();
            await sock.sendMessage(chatId, {
                text: box('SUDO', `*Added @${target.split('@')[0]} as sudo user*\nThey can now use owner commands`),
                mentions: [target]
            }, { quoted: message });

        } else if (action === 'del' || action === 'remove') {
            settings.sudo = settings.sudo.filter(jid => jid!== target);
            saveSettings();
            await sock.sendMessage(chatId, {
                text: box('SUDO', `*Removed @${target.split('@')[0]} from sudo users*`),
                mentions: [target]
            }, { quoted: message });

        } else if (action === 'list') {
            let list = settings.sudo.map(jid => `• @${jid.split('@')[0]}`).join('\n') || 'None';
            await sock.sendMessage(chatId, {
                text: box('SUDO LIST', list),
                mentions: settings.sudo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE sudo command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to manage sudo*')
        }, { quoted: message });
    }
}

// Helper to check if user is sudo
function isSudo(senderId) {
    const ownerId = settings.owner + '@s.whatsapp.net';
    return senderId === ownerId || settings.sudo.includes(senderId);
}

module.exports = { sudoCommand, isSudo };
