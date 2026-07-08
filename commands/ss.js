const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function ssCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.split(' ')[1];

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: box('SCREENSHOT', `*Usage:*.ss <website link>\n*Example:*.ss google.com`)
            }, { quoted: message });
        }

        let finalUrl = url;
        if (!url.startsWith('http')) {
            finalUrl = 'https://' + url;
        }

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE', `*Taking screenshot of:*\n${finalUrl}\nPlease wait 👁️`)
        }, { quoted: message });

        // Free screenshot API
        const ssUrl = `https://api.screenshotmachine.com/?key=YOUR_API_KEY&url=${encodeURIComponent(finalUrl)}&dimension=1280x720&device=desktop`;

        const res = await axios.get(ssUrl, { responseType: 'arraybuffer' });

        await sock.sendMessage(chatId, {
            image: res.data,
            caption: box('SCREENSHOT', `*URL:* ${finalUrl}`)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE ss:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Failed to take screenshot*\nCheck if URL is valid`)
        }, { quoted: message });
    }
}

module.exports = { ssCommand };
