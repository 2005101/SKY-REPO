const axios = require('axios');
const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Using Tenor API - free, no key needed for basic search
async function gifCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ');

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: box('GIF', `*DARK-EYE V3 GIF SEARCH*\n\n*Usage:*.gif happy\n*Usage:*.gif cat dancing\n*Usage:*.gif anime fight`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('GIF', `*Searching: ${query}...*`)
        }, { quoted: message });

        // Tenor API search
        const res = await axios.get(`https://tenor.googleapis.com/v2/search`, {
            params: {
                q: query,
                key: "LIVDSRZULELA", // public key
                limit: 1,
                media_filter: "mp4",
                random: true
            }
        });

        const gifUrl = res.data.results[0]?.media_formats?.mp4?.url;

        if (!gifUrl) {
            return await sock.sendMessage(chatId, {
                text: box('GIF', `*No GIF found for "${query}"*\nTry different keyword`)
            }, { quoted: message });
        }

        const gifBuffer = await axios.get(gifUrl, { responseType: 'arraybuffer' });

        // Send as video with gifPlayback so it auto-loops
        await sock.sendMessage(chatId, {
            video: gifBuffer.data,
            gifPlayback: true,
            caption: `*${query}*`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE gif command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to fetch GIF. Try again!*')
        }, { quoted: message });
    }
}

module.exports = { gifCommand };
