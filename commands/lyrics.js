const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function lyricsCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ');

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: box('LYRICS', `*Usage:*.lyrics <song name>\n*Example:*.lyrics blinding lights`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE', `*Searching lyrics for:* ${query}\nPlease wait 👁️`)
        }, { quoted: message });

        // Free lyrics API
        const res = await axios.get(`https://api.lyrics.ovh/v1/${query.split(' ').slice(0,1).join('')}/${query.split(' ').slice(1).join(' ')}`);
        
        let lyrics = res.data.lyrics;

        if (!lyrics) {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', `*Lyrics not found for:* ${query}`)
            }, { quoted: message });
        }

        // WhatsApp limit is 4096 chars, so split if too long
        if (lyrics.length > 3500) {
            lyrics = lyrics.substring(0, 3500) + '\n\n...*truncated*';
        }

        await sock.sendMessage(chatId, {
            text: box('SONG LYRICS', `*Title:* ${query}\n\n${lyrics}`)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE lyrics:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Lyrics not found*\nTry: *.lyrics artist song name*`)
        }, { quoted: message });
    }
}

module.exports = { lyricsCommand };
