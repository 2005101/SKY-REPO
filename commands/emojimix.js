const axios = require('axios');
const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Emoji mix API
async function getEmojiMix(emoji1, emoji2) {
    const baseUrl = 'https://www.gstatic.com/android/keyboard/emojikitchen/';
    const year = '2023';
    const month = '12'; // Google updates this monthly

    try {
        // Format: u1f600_u1f923
        const e1 = emoji1.codePointAt(0).toString(16);
        const e2 = emoji2.codePointAt(0).toString(16);

        const url = `${baseUrl}${year}${month}/u${e1}/u${e1}_u${e2}.png`;
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return res.data;
    } catch {
        // Try reverse
        try {
            const e1 = emoji2.codePointAt(0).toString(16);
            const e2 = emoji1.codePointAt(0).toString(16);
            const url = `${baseUrl}${year}${month}/u${e1}/u${e1}_u${e2}.png`;
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            return res.data;
        } catch {
            return null;
        }
    }
}

async function emojimixCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation ||
                    message.message?.extendedTextMessage?.text || '';

        const emojis = text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);

        if (!emojis || emojis.length < 2) {
            return await sock.sendMessage(chatId, {
                text: box('EMOJIMIX', `*DARK-EYE V3 EMOJIMIX*\n\n*Usage:*.emojimix 😂❤️\n\n*Example:*.emojimix 🥺🔥`)
            }, { quoted: message });
        }

        const emoji1 = emojis[0];
        const emoji2 = emojis[1];

        await sock.sendMessage(chatId, {
            text: box('EMOJIMIX', `*Mixing ${emoji1} + ${emoji2}...*`)
        }, { quoted: message });

        const stickerBuffer = await getEmojiMix(emoji1, emoji2);

        if (!stickerBuffer) {
            return await sock.sendMessage(chatId, {
                text: box('EMOJIMIX', `*No mix found for ${emoji1} + ${emoji2}*\nTry different emojis`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            packname: settings.packname || 'DARK-EYE V3',
            author: settings.author || 'EMOJIMIX'
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE emojimix command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to mix emojis. Try again!*')
        }, { quoted: message });
    }
}

module.exports = { emojimixCommand };
