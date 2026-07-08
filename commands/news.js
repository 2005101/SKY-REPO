const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function newsCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const category = text.split(' ')[1] || 'general';

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE NEWS', `*Fetching ${category} news...*\nPlease wait 👁️`)
        }, { quoted: message });

        // Free News API - GNews
        const res = await axios.get(`https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=zw&max=5&apikey=YOUR_API_KEY`);
        const articles = res.data.articles;

        if (!articles || articles.length === 0) {
            return await sock.sendMessage(chatId, {
                text: box('ERROR', '*No news found for this category*')
            }, { quoted: message });
        }

        let newsText = `*Category:* ${category.toUpperCase()}\n\n`;
        articles.forEach((news, i) => {
            newsText += `*${i+1}. ${news.title}*\n`;
            newsText += `📰 ${news.source.name}\n`;
            newsText += `🔗 ${news.url}\n\n`;
        });

        await sock.sendMessage(chatId, {
            text: box('LATEST NEWS', newsText.substring(0, 3500))
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE news:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Failed to fetch news*\nTry: *.news technology sports business*`)
        }, { quoted: message });
    }
}

module.exports = { newsCommand };
