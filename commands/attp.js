const axios = require('axios');
const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function attpCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation ||
                    message.message?.extendedTextMessage?.text || '';

        const args = text.split(' ').slice(1).join(' ');

        if (!args) {
            return await sock.sendMessage(chatId, {
                text: box('ATTP', `*DARK-EYE V3 ATTP*\n\n*Usage:* .attp your text here\n\n*Example:* .attp DARK-EYE V3`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            text: box('ATTP', `*Generating ATTP...*\n_Text: ${args}_`)
        }, { quoted: message });

        // Use lolhuman API from config
        const apiKey = settings.APIKeys['https://api.lolhuman.xyz'];
        const url = `https://api.lolhuman.xyz/api/attp?apikey=${apiKey}&text=${encodeURIComponent(args)}`;

        const res = await axios.get(url, { responseType: 'arraybuffer' });

        await sock.sendMessage(chatId, {
            sticker: res.data,
            packname: settings.packname || 'DARK-EYE V3',
            author: settings.author || 'DARK-EYE OFC'
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE attp command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to generate ATTP sticker*\nCheck API key or try again later.')
        }, { quoted: message });
    }
}

module.exports = { attpCommand };
