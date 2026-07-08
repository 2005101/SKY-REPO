const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Add your auto replies here
const autoReplies = {
    "bot": "👁️ Yes boss? DARK-EYE V3 is online!",
    "hi": "Hey there! 👋 How can I help?",
    "hello": "Hello 👋 Welcome to DARK-EYE",
    "good morning": "🌅 Good morning! Have a great day",
    "goodnight": "🌙 Goodnight! Sleep well",
    "bye": "👋 Bye! Come back soon",
    "thanks": "You're welcome 😊",
    "admin": "Tag an admin? Use.tagadmin command",
    "help": "Use *.menu* to see all DARK-EYE commands"
};

let isAutoReplyOn = true; // default on

async function autoreplyCommand(sock, chatId, message, senderId, userMessage) {
    try {
        const text = userMessage.toLowerCase().trim();

        // Toggle command:.autoreply on/off
        if (text.startsWith('.autoreply')) {
            const arg = text.split(' ')[1];
            if (arg === 'on') {
                isAutoReplyOn = true;
                return await sock.sendMessage(chatId, {
                    text: box('AUTOREPLY', '```AutoReply is now ON```')
                }, { quoted: message });
            }
            if (arg === 'off') {
                isAutoReplyOn = false;
                return await sock.sendMessage(chatId, {
                    text: box('AUTOREPLY', '```AutoReply is now OFF```')
                }, { quoted: message });
            }
            return await sock.sendMessage(chatId, {
                text: box('AUTOREPLY', `*Status:* ${isAutoReplyOn? 'ON ✅' : 'OFF ❌'}\n\n*Usage:*.autoreply on\n*Usage:*.autoreply off`)
            }, { quoted: message });
        }

        // Auto reply logic
        if (!isAutoReplyOn || message.key.fromMe) return;

        for (let keyword in autoReplies) {
            if (text.includes(keyword)) {
                await sock.sendMessage(chatId, {
                    text: autoReplies[keyword]
                }, { quoted: message });
                break; // only reply once
            }
        }

    } catch (error) {
        console.error('Error in DARK-EYE autoreply:', error);
    }
}

module.exports = { autoreplyCommand };
