const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function miscCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const cmd = text.split(' ')[0].toLowerCase();
        const args = text.split(' ').slice(1).join(' ');
        const botName = settings.botName || 'DARK-EYE V3';
        const startTime = process.uptime();

        // PING
        if (cmd === '.ping') {
            const start = Date.now();
            await sock.sendMessage(chatId, { text: 'pong' }, { quoted: message });
            const end = Date.now();
            return await sock.sendMessage(chatId, {
                text: box('PING', `*Speed:* ${end - start}ms\n*Uptime:* ${Math.floor(startTime/60)}m ${Math.floor(startTime%60)}s`)
            });
        }

        // ALIVE
        if (cmd === '.alive') {
            return await sock.sendMessage(chatId, {
                text: box('ALIVE', `*${botName} is Online* ✅\n*Mode:* ${settings.mode}\n*Version:* ${settings.version || '3.0.0'}\n*Uptime:* ${Math.floor(startTime/3600)}h ${Math.floor((startTime%3600)/60)}m`)
            }, { quoted: message });
        }

        // OWNER
        if (cmd === '.owner') {
            return await sock.sendMessage(chatId, {
                text: box('OWNER', `*Bot Owner*\n@${settings.owner}\n\n*Bot:* ${botName}`),
                mentions: [settings.owner + '@s.whatsapp.net']
            }, { quoted: message });
        }

        // JID
        if (cmd === '.jid') {
            const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || senderId;
            return await sock.sendMessage(chatId, {
                text: box('JID', `*JID:* ${target}`)
            }, { quoted: message });
        }

        // CALC
        if (cmd === '.calc') {
            if (!args) return await sock.sendMessage(chatId, { text: box('CALC', `*Usage:*.calc 2+2*`) }, { quoted: message });
            try {
                const result = eval(args.replace(/[^0-9+\-*/(). ]/g, ''));
                return await sock.sendMessage(chatId, {
                    text: box('CALCULATOR', `*Question:* ${args}\n*Answer:* ${result}`)
                }, { quoted: message });
            } catch {
                return await sock.sendMessage(chatId, { text: box('ERROR', '*Invalid calculation*') }, { quoted: message });
            }
        }

        // TIME
        if (cmd === '.time') {
            const time = new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Harare' });
            return await sock.sendMessage(chatId, {
                text: box('TIME', `*Zimbabwe Time:* ${time}`)
            }, { quoted: message });
        }

        // DATE
        if (cmd === '.date') {
            const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Harare' });
            return await sock.sendMessage(chatId, {
                text: box('DATE', `*Today:* ${date}`)
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE misc:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Command failed*')
        }, { quoted: message });
    }
}

module.exports = { miscCommand };
