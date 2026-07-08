const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function helpCommand(sock, chatId, message, senderId) {
    try {
        const ownerId = settings.owner + '@s.whatsapp.net';
        const botName = settings.botName || 'DARK-EYE V3';
        const prefix = '.';

        const menu = `
*Bot:* ${botName} | *v${settings.version || '3.0.0'}*
*Owner:* @${settings.owner} | *Mode:* ${settings.mode.toUpperCase()}
*Prefix:* ${prefix}

╔═══════════════════════╗
🌐 *GENERAL COMMANDS*
║ ${prefix}help
║ ${prefix}ping
║ ${prefix}alive
║ ${prefix}owner
║ ${prefix}jid
║ ${prefix}joke
║ ${prefix}quote
║ ${prefix}fact
║ ${prefix}weather <city>
║ ${prefix}news
║ ${prefix}time
║ ${prefix}date
║ ${prefix}calc <1+2>
║ ${prefix}translate <text>
║ ${prefix}ss <link>
║ ${prefix}url <link>
║ ${prefix}shorturl <link>
║ ${prefix}tts <text>
║ ${prefix}trt <text> <lang>
║ ${prefix}attp <text>
╚═══=≈=====═════════===═══╝

╔════════==========═══════╗
👮 *ADMIN COMMANDS*
║ ${prefix}kick @user
║ ${prefix}ban @user
║ ${prefix}unban @user
║ ${prefix}promote @user
║ ${prefix}demote @user
║ ${prefix}mute <mins>
║ ${prefix}unmute
║ ${prefix}delete / ${prefix}del
║ ${prefix}clear
║ ${prefix}tag <msg>
║ ${prefix}tagall
║ ${prefix}tagadmin
║ ${prefix}hidetag <msg>
║ ${prefix}warnings @user
║ ${prefix}warn @user
║ ${prefix}resetwarn @user
║ ${prefix}antilink on/off
║ ${prefix}antibadword on/off
║ ${prefix}welcome on/off
║ ${prefix}goodbye on/off
╚════════===========═══════╝

╔════════===========═══════╗
🔒 *OWNER/SUDO COMMANDS*
║ ${prefix}mode public/private
║ ${prefix}sudo add/del @user
║ ${prefix}sudo list
║ ${prefix}autoreply on/off
║ ${prefix}autoread on/off
║ ${prefix}autotyping on/off
║ ${prefix}autostatus on/off
║ ${prefix}autoreact on/off
║ ${prefix}anticall on/off
║ ${prefix}pmblocker on/off
║ ${prefix}setpp <reply img>
║ ${prefix}setname <name>
║ ${prefix}setbio <bio>
║ ${prefix}restart
║ ${prefix}update
╚═══════════════════════╝

╔═══════════════════════╗
🎨 *IMAGE/EDIT COMMANDS*
║ ${prefix}sticker <reply img>
║ ${prefix}simage <reply sticker>
║ ${prefix}removebg
║ ${prefix}blur <reply img>
║ ${prefix}crop <reply img>
║ ${prefix}remini <reply img>
║ ${prefix}circle <reply img>
║ ${prefix}wasted @user
║ ${prefix}triggered <reply img>
║ ${prefix}jail @user
║ ${prefix}gay @user
║ ${prefix}glass @user
║ ${prefix}lolice @user
║ ${prefix}oogway <text>
║ ${prefix}tweet <text>
╚═════========══════════╝

╔═══════════════════════╗
🤖 *AI COMMANDS*
║ ${prefix}gpt <question>
║ ${prefix}gemini <question>
║ ${prefix}imagine <prompt>
║ ${prefix}flux <prompt>
║ ${prefix}sora <prompt>
║ ${prefix}character @user
║ ${prefix}roast @user
║ ${prefix}compliment @user
║ ${prefix}advice
║ ${prefix}8ball <question>
╚═══════════════════════╝

╔═══════════════════════╗
📥 *DOWNLOADER COMMANDS*
║ ${prefix}play <song>
║ ${prefix}song <song>
║ ${prefix}video <name>
║ ${prefix}ytmp4 <link>
║ ${prefix}ytmp3 <link>
║ ${prefix}instagram <link>
║ ${prefix}tiktok <link>
║ ${prefix}facebook <link>
║ ${prefix}spotify <query>
║ ${prefix}pinterest <query>
╚═══════════════════════╝

╔═════=========══════════╗
🎮 *FUN/GAMES COMMANDS*
║ ${prefix}goodbye
║ ${prefix}goodnight
║ ${prefix}flirt
║ ${prefix}shayari
║ ${prefix}truth
║ ${prefix}dare
║ ${prefix}tictactoe @user
║ ${prefix}hangman
║ ${prefix}ship @user
║ ${prefix}meme
╚═══════════════════════╝
`;

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE V3 MENU', menu),
            mentions: [ownerId]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE help command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to load menu*')
        }, { quoted: message });
    }
}

module.exports = { helpCommand };
