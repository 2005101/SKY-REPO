const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function memeCommand(sock, chatId, message, senderId) {
    try {
        await sock.sendMessage(chatId, {
            text: box('DARK-EYE', `*Fetching meme...*\nPlease wait 👁️`)
        }, { quoted: message });

        // Free meme API
        const res = await axios.get('https://meme-api.com/gimme');
        const data = res.data;

        if (!data.url) {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', '*Failed to fetch meme*')
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            image: { url: data.url },
            caption: box('RANDOM MEME', `*Title:* ${data.title}\n*Subreddit:* r/${data.subreddit}\n*Ups:* ${data.ups}`)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE meme:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to load meme. Try again*')
        }, { quoted: message });
    }
}

module.exports = { memeCommand };
