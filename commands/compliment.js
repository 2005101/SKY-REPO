const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

const complimentList = [
    "Your vibe is top tier 😎",
    "You’ve got the kind of energy that lights up the chat ✨",
    "Not gonna lie, your jokes are elite 😂",
    "You’re the main character energy here 👑",
    "10/10 personality detected ✅",
    "Talking to you is the best part of my day 😊",
    "You’re proof that cool people do exist",
    "If confidence was a person, it’d be you 💯"
];

async function complimentCommand(sock, chatId, message, senderId) {
    try {
        const randomComp = complimentList[Math.floor(Math.random() * complimentList.length)];

        await sock.sendMessage(chatId, {
            text: box('COMPLIMENT', `*For you:* @${senderId.split('@')[0]}\n\n${randomComp}`),
            mentions: [senderId]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE compliment command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to send compliment*')
        }, { quoted: message });
    }
}

module.exports = { complimentCommand };
