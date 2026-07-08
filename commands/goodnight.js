const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

const goodnightMsgs = [
    "🌙 Goodnight @user! Sweet dreams ✨",
    "💤 Time to sleep @user. See you tomorrow!",
    "🌟 Sleep tight @user. Rest well!",
    "😴 Goodnight @user! Don't let the bugs bite 😂",
    "🌌 Rest your eyes @user. New day, new wins tomorrow",
    "🫡 Logging off @user. Have a peaceful night!",
    "☁️ Night night @user! Dream big"
];

async function goodnightCommand(sock, chatId, message, senderId) {
    try {
        const randomMsg = goodnightMsgs[Math.floor(Math.random() * goodnightMsgs.length)];

        await sock.sendMessage(chatId, {
            text: box('GOODNIGHT', randomMsg),
            mentions: [senderId]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE goodnight command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to send goodnight message*')
        }, { quoted: message });
    }
}

// Optional: Auto goodnight at specific time - 10PM
async function autoGoodnight(sock, chatId) {
    const hour = new Date().getHours();
    if (hour === 22) { // 10PM
        const randomMsg = goodnightMsgs[Math.floor(Math.random() * goodnightMsgs.length)];
        await sock.sendMessage(chatId, {
            text: box('AUTO GOODNIGHT', `${randomMsg}\n\n*DARK-EYE reminding you to rest*`)
        });
    }
}

module.exports = { goodnightCommand, autoGoodnight };
