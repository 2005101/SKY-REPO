const settings = require('../settings');
const fs = require('fs');
const path = require('path');

function box(title, body) {
    return `╭───────❰ 👁️ *${title}* ❱───────╮
|${body}
╰───────────────────────╯

> *POWERED BY DARK-EYE OFC*`
}

const totalCmds = 130;

async function menuCommand(sock, chatId, message, senderId, prefix) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = text.split(' ')[1]?.toLowerCase() || 'all';

    const menus = {
        general: `║➤ ${prefix}help
║➤ ${prefix}ping
║➤ ${prefix}alive
║➤ ${prefix}owner
║➤ ${prefix}jid
║➤ ${prefix}joke
║➤ ${prefix}quote
║➤ ${prefix}fact
║➤ ${prefix}weather <city>
║➤ ${prefix}news
║➤ ${prefix}time
║➤ ${prefix}date
║➤ ${prefix}calc <1+2>
║➤ ${prefix}translate <text>
║➤ ${prefix}ss <link>
║➤ ${prefix}url <link>
║➤ ${prefix}shorturl <link>
║➤ ${prefix}tts <text>
║➤ ${prefix}trt <text> <lang>
║➤ ${prefix}attp <text>
║➤ ${prefix}zimvibes
║➤ ${prefix}settings`,
        group: `║➤ ${prefix}kick @user
║➤ ${prefix}ban @user
║➤ ${prefix}unban @user
║➤ ${prefix}promote @user
║➤ ${prefix}demote @user
║➤ ${prefix}mute <mins>
║➤ ${prefix}unmute
║➤ ${prefix}delete / ${prefix}del
║➤ ${prefix}clear
║➤ ${prefix}grpclear
║➤ ${prefix}tag <msg>
║➤ ${prefix}tagall
║➤ ${prefix}tagadmin
║➤ ${prefix}hidetag <msg>
║➤ ${prefix}warnings @user
║➤ ${prefix}warn @user
║➤ ${prefix}resetwarn @user
║➤ ${prefix}antilink on/off
║➤ ${prefix}antibadword on/off
║➤ ${prefix}antimention on/off
║➤ ${prefix}antidelete on/off
║➤ ${prefix}welcome on/off
║➤ ${prefix}goodbye on/off
║➤ ${prefix}gpfakemember <no>
║➤ ${prefix}fakenumbers
║➤ ${prefix}fakeaino`,
        owner: `║➤ ${prefix}mode public/private
║➤ ${prefix}sudo add/del @user
║➤ ${prefix}sudo list
║➤ ${prefix}autoreply on/off
║➤ ${prefix}autoread on/off
║➤ ${prefix}autotyping on/off
║➤ ${prefix}autostatus on/off
║➤ ${prefix}autoreact on/off
║➤ ${prefix}anticall on/off
║➤ ${prefix}pmblocker on/off
║➤ ${prefix}setpp <reply img>
║➤ ${prefix}setfullpp <reply img>
║➤ ${prefix}setbotimage <reply img/link>
║➤ ${prefix}setname <name>
║➤ ${prefix}setbio <bio>
║➤ ${prefix}setprefix <newprefix>
║➤ ${prefix}repo
║➤ ${prefix}fork <repo>
║➤ ${prefix}star <repo>
║➤ ${prefix}restart
║➤ ${prefix}update`,
        image: `║➤ ${prefix}sticker <reply img>
║➤ ${prefix}simage <reply sticker>
║➤ ${prefix}removebg
║➤ ${prefix}blur <reply img>
║➤ ${prefix}crop <reply img>
║➤ ${prefix}remini <reply img>
║➤ ${prefix}circle <reply img>
║➤ ${prefix}wasted @user
║➤ ${prefix}triggered <reply img>
║➤ ${prefix}jail @user
║➤ ${prefix}gay @user
║➤ ${prefix}glass @user
║➤ ${prefix}lolice @user
║➤ ${prefix}oogway <text>
║➤ ${prefix}tweet <text>
║➤ ${prefix}emojimix <emoji1>+<emoji2>`,
        ai: `║➤ ${prefix}gpt <question>
║➤ ${prefix}gemini <question>
║➤ ${prefix}imagine <prompt>
║➤ ${prefix}flux <prompt>
║➤ ${prefix}sora <prompt>
║➤ ${prefix}character @user
║➤ ${prefix}roast @user
║➤ ${prefix}compliment @user
║➤ ${prefix}advice
║➤ ${prefix}8ball <question>
║➤ ${prefix}chatbot on/off`,
        download: `║➤ ${prefix}play <song>
║➤ ${prefix}song <song>
║➤ ${prefix}video <name>
║➤ ${prefix}ytmp4 <link>
║➤ ${prefix}ytmp3 <link>
║➤ ${prefix}instagram <link>
║➤ ${prefix}igs <link>
║➤ ${prefix}tiktok <link>
║➤ ${prefix}facebook <link>
║➤ ${prefix}spotify <query>
║➤ ${prefix}pinterest <query>
║➤ ${prefix}movie <name>`,
        fun: `║➤ ${prefix}goodbye
║➤ ${prefix}goodnight
║➤ ${prefix}flirt
║➤ ${prefix}shayari
║➤ ${prefix}truth
║➤ ${prefix}dare
║➤ ${prefix}tictactoe @user
║➤ ${prefix}hangman
║➤ ${prefix}ship @user
║➤ ${prefix}meme
║➤ ${prefix}lyrics <song>`,
        admin: `║➤ ${prefix}creategp <name>
║➤ ${prefix}createchannel <name>
║➤ ${prefix}fakereact <no> <channel link>
║➤ ${prefix}fakefollow <no> <channel link>
║➤ ${prefix}purge
║➤ ${prefix}misc`
    };

    let result = `╔════════==========═══════╗
   *DARK-EYE MD COMMANDS LIST*
   ╚═══════════════════════╝
> *TOTAL COMMANDS ${totalCmds}*\n`;

    if (args === 'all' || args === 'menu') {
        result += `╔═══════════════════════╗
🌐 *GENERAL COMMANDS*
╚═══════════════╝
${menus.general}
╚═══=≈=====═════════===═══╝

╔════════==========═══════╗
👮 *GROUP COMMANDS*
╚═══════════════╝
${menus.group}
╚════════==========═══════╝

╔════════==========═══════╗
🔒 *OWNER/SUDO COMMANDS*
╚═══════════════╝
${menus.owner}
╚═══════════════════════╝

╔═══════════════════════╗
🎨 *IMAGE/EDIT COMMANDS*
╚═══════════════╝
${menus.image}
╚═════=========══════════╝

╔═══════════════════════╗
🤖 *AI COMMANDS*
╚═══════════════╝
${menus.ai}
╚═══════════════════════╝

╔═══════════════════════╗
📥 *DOWNLOADER COMMANDS*
╚═══════════════╝
${menus.download}
╚═══════════════════════╝

╔═════=========══════════╗
🎮 *FUN/GAMES COMMANDS*
╚═══════════════╝
${menus.fun}
╚═══════════════════════╝`;
    } else {
        result += menus[args] || menus.general;
    }

    result += `\n\n*📢 Join our channel for updates:*\nhttps://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A`;

    // LOAD IMAGE FROM ASSETS
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

    try {
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: box('MENU', result),
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
        } else {
            // fallback to text if image not found
            await sock.sendMessage(chatId, {
                text: box('MENU', result),
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
        }
    } catch (err) {
        console.log('Error sending menu image:', err);
        await sock.sendMessage(chatId, { text: box('MENU', result) }, { quoted: message });
    }
}

module.exports = { menuCommand };
