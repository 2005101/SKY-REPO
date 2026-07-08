const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function igsCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const username = text.split(' ')[1];

        if (!username) {
            return await sock.sendMessage(chatId, {
                text: box('IGS DOWNLOADER', `*Usage:*.igs <username>\n*Example:*.igs cristiano`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE', `*Fetching @${username}'s stories...*\nPlease wait 👁️`)
        }, { quoted: message });

        // Using ig-downloader API
        const res = await axios.get(`https://api.agatz.xyz/api/ig/story?username=${username}`);

        if (!res.data || res.data.data.length === 0) {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', `*@${username} has no active stories*`)
            }, { quoted: message });
        }

        const stories = res.data;
        let sent = 0;

        for (let i = 0; i < stories.length; i++) {
            const story = stories[i];

            if (story.mediaType === 'image') {
                await sock.sendMessage(chatId, {
                    image: { url: story.url },
                    caption: box('INSTAGRAM STORY', `*User:* @${username}\n*Type:* Image\n*${i+1}/${stories.length}*`)
                }, { quoted: message });
            } else if (story.mediaType === 'video') {
                await sock.sendMessage(chatId, {
                    video: { url: story.url },
                    caption: box('INSTAGRAM STORY', `*User:* @${username}\n*Type:* Video\n*${i+1}/${stories.length}*`)
                }, { quoted: message });
            }
            sent++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
        }

        await sock.sendMessage(chatId, {
            text: box('DONE', `*Sent ${sent} stories from @${username}*`)
        });

    } catch (error) {
        console.error('Error in DARK-EYE igs:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Failed to fetch stories*\n\nPossible reasons:\n1. Account is private\n2. Username wrong\n3. No active stories`)
        }, { quoted: message });
    }
}

module.exports = { igsCommand };
