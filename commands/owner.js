const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function ownerCommand(sock, chatId, message, senderId) {
    try {
        const ownerInfo = `*DARK-EYE V3 OWNER INFO*

*Name:* ALEX THEON 
*USERNAME:* DARK-EYE OFC DEV 
*LOCATION:* ZIMBABWE 🇿🇼 
*HOBBY:* CODING
*CALL:* +263717400463
*APP:* +263783546271

*SUPPORT SERVICES*
alextheon.com.free 

*EMAIL US*
alextheon.com.free 

Type *.menu* to see all commands`;

        // Send with owner contact
        await sock.sendMessage(chatId, {
            text: box('OWNER', ownerInfo),
            contextInfo: {
                mentionedJid: [settings.owner + '@s.whatsapp.net']
            }
        }, { quoted: message });

        // Also send vCard contact
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:ALEX THEON
ORG:DARK-EYE OFC DEV
TEL;type=CELL;type=VOICE;waid=263717400463:+263 717 400 463
TEL;type=CELL;type=WHATSAPP;waid=263783546271:+263 783 546 271
ADR:;;ZIMBABWE;;;;
EMAIL:alextheon.com.free
END:VCARD`;

        await sock.sendMessage(chatId, {
            contacts: {
                displayName: 'ALEX THEON',
                contacts: [{ vcard }]
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE owner:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to load owner info*')
        }, { quoted: message });
    }
}

module.exports = { ownerCommand };
