const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Dare list
const dareList = [
    "Send a voice note saying 'I love DARK-EYE V3' 😂",
    "Change your profile pic to a cartoon for 1 hour",
    "Send the last photo in your gallery",
    "Call your crush and say 'hi' then hang up",
    "Post a status saying 'I am single' for 10 minutes",
    "Send 5 ❤️ to the person above you",
    "Dance for 10 seconds and send the video",
    "Let the person above you text from your WhatsApp for 2 mins",
    "Send a screenshot of your WhatsApp chat list",
    "Say 'I am a potato' in 3 group chats",
    "Send a voice note singing any song",
    "Change your name to 'DARK-EYE SLAVE' for 30 mins",
    "Send 'I am stupid' to your mom",
    "Do 10 pushups and send proof",
    "Send the funniest meme you have",
    "Let someone in this group choose your DP",
    "Type the alphabet backwards",
    "Send a selfie with a funny face",
    "Confess your crush name here",
    "Send 'Marry me' to the 3rd person in this group"
];

async function dareCommand(sock, chatId, message, senderId) {
    try {
        const randomDare = dareList[Math.floor(Math.random() * dareList.length)];

        await sock.sendMessage(chatId, {
            text: box('DARE', `*YOUR DARE:* 👁️\n\n${randomDare}\n\n*Reply 'done' when you complete it*`),
            mentions: [senderId]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE dare command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Error getting dare. Try again!*')
        }, { quoted: message });
    }
}

module.exports = { dareCommand };
