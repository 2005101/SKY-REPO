const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function purgeCommand(sock, chatId, message, args, senderId) {
    try {
        const isOwnerOrSudo = message.key.fromMe || senderId === settings.owner?.[0] || settings.sudo?.includes(senderId);

        // Check admin in groups
        if (chatId.endsWith('@g.us')) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const botId = sock.user.id;
            const botMember = groupMetadata.participants.find(p => p.id === botId);
            const senderMember = groupMetadata.participants.find(p => p.id === senderId);

            if (!botMember?.admin) {
                return await sock.sendMessage(chatId, {
                    text: box('PURGE', '```Bot must be admin to delete messages```')
                }, { quoted: message });
            }

            if (!senderMember?.admin &&!isOwnerOrSudo) {
                return await sock.sendMessage(chatId, {
                    text: box('PURGE', '```Only Group Admins Can Use This!```')
                }, { quoted: message });
            }
        }

        const count = parseInt(args) || 10;

        if (count < 2 || count > 100) {
            return await sock.sendMessage(chatId, {
                text: box('PURGE', `*Usage:*.purge 10\n*Min:* 2 messages\n*Max:* 100 messages`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('PURGE', `*Deleting ${count} messages...*`)
        }, { quoted: message });

        // Fetch last messages
        const messages = await sock.fetchMessageHistory(count, chatId);

        // Delete each message
        let deleted = 0;
        for (let msg of messages) {
            try {
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: msg.key.fromMe,
                        id: msg.key.id,
                        participant: msg.key.participant
                    }
                });
                deleted++;
                await new Promise(r => setTimeout(r, 100)); // delay to avoid rate limit
            } catch {}
        }

        await sock.sendMessage(chatId, {
            text: box('PURGE', `✅ *Deleted ${deleted}/${count} messages*`)
        });

    } catch (error) {
        console.error('Error in DARK-EYE purge command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to purge messages*\nMessages older than 3 months cannot be deleted.')
        }, { quoted: message });
    }
}

module.exports = { purgeCommand };
