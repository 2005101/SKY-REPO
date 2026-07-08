const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function groupinfoCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: box('GROUPINFO', '```This command only works in groups!```')
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('GROUPINFO', '*Fetching group details...*')
        }, { quoted: message });

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants;
        
        const groupAdmins = participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`);
        const groupMembers = participants.map(p => p.id);
        
        const owner = participants.find(p => p.admin === 'superadmin')?.id || 'Unknown';
        const created = new Date(metadata.creation * 1000).toLocaleDateString();
        const desc = metadata.desc || 'No description set';

        let info = `*Group Name:* ${metadata.subject}\n`;
        info += `*Group ID:* ${chatId}\n`;
        info += `*Created On:* ${created}\n`;
        info += `*Group Owner:* @${owner.split('@')[0]}\n`;
        info += `*Total Members:* ${participants.length}\n`;
        info += `*Admins:* ${groupAdmins.length}\n\n`;
        info += `*Admin List:*\n${groupAdmins.join('\n')}\n\n`;
        info += `*Description:*\n${desc}`;

        // Send with group pic if available
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = null;
        }

        if (pp) {
            await sock.sendMessage(chatId, {
                image: { url: pp },
                caption: box('GROUP INFO', info),
                mentions: 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: box('GROUP INFO', info),
                mentions: 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in DARK-EYE groupinfo command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to fetch group info*')
        }, { quoted: message });
    }
}

module.exports = { groupinfoCommand };
