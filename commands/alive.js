const settings = require("../settings");

// DARK-EYE V3 BOX FUNCTION
const DARK_EYE_CHANNEL = 'DARK-EYE V3'
const DARK_EYE_LINK = 'https://whatsapp.com/channel/120363422220480'

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

_Forwarded from ${DARK_EYE_CHANNEL}_
${DARK_EYE_LINK}`
}

async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = box(
            `DARK-EYE V3 IS ACTIVE`,
            `*Version:* ${settings.version}
*Status:* Online ✅
*Mode:* ${settings.commandMode.toUpperCase()}
*Owner:* ${settings.botOwner}

*🌟 FEATURES:*
- AI Chat: .gpt / .gemini  
- Group Management
- Antilink Protection
- Downloaders
- And more!

Type *.menu* for full command list`
        );

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'DARK-EYE V3 OFC',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: box('DARK-EYE V3', 'Bot is alive and running! ✅') 
        }, { quoted: message });
    }
}

module.exports = aliveCommand;
