const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function timeCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1).join(' ');

        // Default to Zimbabwe if no timezone given
        const timezone = args.toLowerCase() || 'africa/harare';

        const timeZones = {
            'zimbabwe': 'Africa/Harare',
            'harare': 'Africa/Harare',
            'south africa': 'Africa/Johannesburg',
            'nigeria': 'Africa/Lagos',
            'kenya': 'Africa/Nairobi',
            'uk': 'Europe/London',
            'usa': 'America/New_York',
            'india': 'Asia/Kolkata',
            'dubai': 'Asia/Dubai',
            'china': 'Asia/Shanghai'
        };

        const tz = timeZones[timezone] || timezone;

        const now = new Date();
        const time = now.toLocaleTimeString('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const date = now.toLocaleDateString('en-GB', {
            timeZone: tz,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeText = `*Location:* ${timezone.toUpperCase()}
*Time:* ${time}
*Date:* ${date}`;

        await sock.sendMessage(chatId, {
            text: box('TIME & DATE', timeText)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE time:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', `*Invalid timezone*\n*Example:*.time zimbabwe\n*.time uk\n*.time usa`)
        }, { quoted: message });
    }
}

module.exports = { timeCommand };
