const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

const insults = [
    "Bro your brain has 2 tabs open and both are frozen 🥶",
    "I'd agree with you but then we'd both be wrong",
    "Your face is like a wasted potato",
    "You're proof that even evolution takes breaks",
    "If I wanted to kill myself I'd climb your ego and jump to your IQ",
    "You're the reason the gene pool needs a lifeguard",
    "I bet your brain comes with a low battery warning",
    "You're like a cloud. When you disappear it's a beautiful day",
    "You have the charisma of a damp sock",
    "Mirrors hate you and cameras are scared of you",
    "You're not stupid, you just have bad luck when thinking",
    "I will never forget the first time we met. But I'll keep trying",
    "You're the human version of a participation trophy",
    "Your secrets are safe with me. I never even listen when you tell me",
    "I'd roast you but my mom said not to burn trash"
];

async function insultCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentioned.length === 0) {
            return await sock.sendMessage(chatId, {
                text: box('INSULT', `*Usage:*.insult @user\n*Example:*.insult @John`)
            }, { quoted: message });
        }

        const target = mentioned[0];
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE ROAST', `🎯 ${randomInsult}`),
            mentions: [target]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE insult:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to roast*')
        }, { quoted: message });
    }
}

module.exports = { insultCommand };
