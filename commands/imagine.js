const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function imagineCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const prompt = text.split(' ').slice(1).join(' ');

        if (!prompt) {
            return await sock.sendMessage(chatId, {
                text: box('IMAGINE AI', `*Usage:*.imagine <your prompt>\n*Example:*.imagine a cyberpunk city at night`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE AI', `*Generating image...*\n*Prompt:* ${prompt}\n\nPlease wait 10-20s 👁️`)
        }, { quoted: message });

        // Free AI Image API - Pollinations
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random()*10000)}`;
        
        const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(res.data);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: box('AI GENERATED', `*Prompt:* ${prompt}\n*By:* DARK-EYE AI`)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE imagine:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Failed to generate image*\nTry again with a different prompt`)
        }, { quoted: message });
    }
}

module.exports = { imagineCommand };
