const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

const goodbyeMsgs = [
    "👋 @user left the group. Take care!",
    "🚪 @user has left. We'll miss you!",
    "💔 @user said goodbye. Safe travels!",
    "✨ @user left. Hope to see you again!",
    "😔 @user is gone. Group feels empty now"
];

const manualGoodbye = [
    "👋 Bye bye! Come back soon",
    "🚀 See ya later!",
    "💤 Take care and goodnight",
    "🫡 Mission complete. Logging off",
    "✌️ Peace out!"
];

async function goodbyeCommand(sock, chatId, message, senderId) {
    try {
        const randomMsg = manualGoodbye[Math.floor(Math.random() * manualGoodbye.length)];
        await sock.sendMessage(chatId, {
            text: box('GOODBYE', `${randomMsg}\n\n*From:* @${senderId.split('@')[0]}`),
            mentions: [senderId]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in DARK-EYE goodbye command:', error);
    }
}

// Auto goodbye when member leaves
async function handleGroupLeave(sock, update) {
    try {
        const { id, participants, action } = update;
        if (action === 'remove' || action === 'leave') {
            const metadata = await sock.groupMetadata(id);
            const groupName = metadata.subject;
            const membersBefore = metadata.participants.length + participants.length; // + those who left
            const membersAfter = metadata.participants.length;

            for (let user of participants) {
                const randomMsg = goodbyeMsgs[Math.floor(Math.random() * goodbyeMsgs.length)];
                const msg = randomMsg.replace('@user', `@${user.split('@')[0]}`);

                const body = `${msg}\n\n` +
                    `*Group:* ${groupName}\n` +
                    `*Members Before:* ${membersBefore}\n` +
                    `*Members Now:* ${membersAfter}`;

                await sock.sendMessage(id, {
                    text: box('MEMBER LEFT', body),
                    mentions: [user]
                });
            }
        }
    } catch (error) {
        console.error('Error in DARK-EYE goodbye handler:', error);
    }
}

module.exports = { goodbyeCommand, handleGroupLeave };
