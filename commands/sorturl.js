const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function shorturlCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ');
        const longUrl = args[1];
        const customAlias = args[2] || '';

        if (!longUrl) {
            return await sock.sendMessage(chatId, {
                text: box('SHORT URL', `*Usage:*.shorturl <link> [custom]\n\n*Examples:*\n.shorturl https://google.com\n.shorturl https://site.com dark-eye-ofc\n.shorturl https://site.com xxxxxx`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE', `*Shortening link...*\n${longUrl}\nPlease wait 👁️`)
        }, { quoted: message });

        // Using TinyURL API + Custom Domain logic
        let shortLink = '';

        if (customAlias) {
            // Custom domain style: https://dark-eye-ofc.xxxxxx.site
            const domain = `https://${customAlias}.xxxxxx.site`;
            shortLink = domain;
            // Note: This is display only. For real redirect you need to host redirect on that domain
        } else {
            // Real shortener - TinyURL
            const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
            shortLink = res.data;
        }

        const resultText = `*Original:* ${longUrl}
*Shortened:* ${shortLink}
${customAlias? `*Custom Domain:* ${shortLink}` : ''}

*Supported formats:*
https://dark-eye-ofc.xxxxxx.site
dark-eye-ofc/xxxxxxxx.site
https://xxxxxxxxx/dark-eye-ofc.site
dark-eye-ofc/xxxxxx.tinyurl`;

        await sock.sendMessage(chatId, {
            text: box('URL SHORTENED', resultText)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE shorturl:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Failed to shorten URL*\nCheck if link is valid`)
        }, { quoted: message });
    }
}

module.exports = { shorturlCommand };
