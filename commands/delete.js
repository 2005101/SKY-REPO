const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function deleteCommand(sock, chatId, message, senderId) {
    try {
        const isOwnerOrSudo = message.key.fromMe || senderId === settings.owner?.[0] || settings.sudo?.includes(senderId);

        // Check if replying to a message
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedKey = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (!quotedMsg &&!quotedKey) {
            return await sock.sendMessage(chatId, {
                text: box('DELETE', '```Reply to a message to delete it```')
            }, { quoted: message });
        }

        // For groups: check if bot is admin
        if (chatId.endsWith('@g.us')) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const botId = sock.user.id;
            const botMember = groupMetadata.participants.find(p => p.id === botId);

            if (!botMember?.admin &&!isOwnerOrSudo) {
                return await sock.sendMessage(chatId, {
                    text: box('DELETE', '```Bot needs to be admin to delete others messages```')
                }, { quoted: message });
            }

            // Only admin/owner can delete others msg
            if (quotedParticipant!== botId &&!isOwnerOrSudo) {
                const senderMember = groupMetadata.participants.find(p => p.id === senderId);
                if (!senderMember?.admin) {
                    return await sock.sendMessage(chatId, {
                        text: box('DELETE', '```Only Admins can delete others messages```')
                    }, { quoted: message });
                }
            }
        }

        // Delete the quoted message
        await sock.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                fromMe: quotedParticipant === sock.user.id,
                id: quotedKey,
                participant: quotedParticipant
            }
        });

        await sock.sendMessage(chatId, {
            text: box('DELETE', '✅ *Message deleted successfully*')
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE delete command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to delete message*\nBot might not be admin or message is too old.')
        }, { quoted: message });
    }
}

module.exports = { deleteCommand };
