// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
  fs.readdir(customTemp, (err, files) => {
    if (err) return;
    for (const file of files) {
      const filePath = path.join(customTemp, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
  console.log('🧹 DARK-EYE V3: Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');
const { autoreplyCommand } = require('./commands/autoreply'); // NEW

// Command imports
const { menuCommand } = require('./commands/menu'); // NEW
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const pinCommand = require('./commands/pin');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection, Antilink } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Grouplink } = require('./commands/glink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagOnlineCommand = require('./commands/tagonline');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, checkBadword } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');

// NEW COMMAND IMPORTS
const { zimvibesCommand } = require('./commands/zimvibes');
const { grpclearCommand } = require('./commands/grpclear');
const { antimentionCommand } = require('./commands/antimention');
const { setfullppCommand } = require('./commands/setfullpp');
const { setbotimageCommand } = require('./commands/setbotimage');
const { setprefixCommand } = require('./commands/setprefix');
const { repoCommand, forkCommand, starCommand } = require('./commands/githubtools');
const { creategpCommand } = require('./commands/creategp');
const { createchannelCommand } = require('./commands/createchannel');
const { fakereactCommand } = require('./commands/fakereact');
const { fakefollowCommand } = require('./commands/fakefollow');
const { gpfakememberCommand } = require('./commands/gpfakemember');
const { fakenumbersCommand } = require('./commands/fakenumbers');
const { fakeainoCommand } = require('./commands/fakeaino');
const { shorturlCommand } = require('./commands/shorturl');
const { chatbotCommand } = require('./commands/chatbot');
const { modeCommand } = require('./commands/mode');
const { purgeCommand } = require('./commands/purge');
const { movieCommand } = require('./commands/movie');

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.ytch = "DARK-EYE V3";

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'DARK-EYE V3 OFC',
            serverMessageId: -1
        }
    }
};

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type!== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        await handleAutoread(sock, message);
        if (message.message) storeMessage(sock, message);

        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // ANTICALL HANDLER
        sock.ev.on('call', async (callData) => {
            if (!settings.anticall) return;
            for (let call of callData) {
                if (call.status === 'offer') {
                    const callerId = call.from;
                    await sock.rejectCall(call.id, callerId);
                    await sock.sendMessage(callerId, {
                        text: box('ANTI-CALL', `*CALL REJECTED* 👁️\n\n@${callerId.split('@')[0]} Calling is not allowed!\nPlease text instead.`),
                        mentions: [callerId]
                    });
                }
            }
        });

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() || '';

        if (userMessage.startsWith('.')) console.log(`👁️ DARK-EYE V3 Command: ${userMessage}`);

        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch {}

        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

        if (isBanned(senderId) &&!userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, { text: box('BANNED', '❌ You are banned from using DARK-EYE V3'),...channelInfo });
            }
            return;
        }

        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // MODERATION
        if (isGroup) {
            await checkBadword(sock, message);
            if (userMessage) await Antilink(message, sock);
            await Grouplink(message, sock);
        }

        // PM BLOCKER
        if (!isGroup &&!message.key.fromMe &&!senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    await sock.sendMessage(chatId, { text: box('PM-BLOCKER', pmState.message || 'Private messages are blocked.') });
                    await new Promise(r => setTimeout(r, 1500));
                    await sock.updateBlockStatus(chatId, 'block');
                    return;
                }
            } catch {}
        }

        // AUTOREPLY
        if (!userMessage.startsWith('.') && settings.autoreply) {
            await autoreplyCommand(sock, chatId, message);
        }

        if (!userMessage.startsWith('.')) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                if (isPublic || isOwnerOrSudoCheck) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }

        if (!isPublic &&!isOwnerOrSudoCheck) return;

        const args = rawText.split(' ');
        const cmd = args[0].toLowerCase();

        // ADMIN/OWNER CHECKS
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp', '.antibadword', '.grpclear'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));
        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.setfullpp', '.setbotimage', '.setprefix', '.clearsession', '.areact', '.autotyping', '.autoread', '.pmblocker', '.anticall', '.autoreply', '.repo', '.fork', '.star'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: box('ERROR', 'Please make DARK-EYE V3 an admin'),...channelInfo }, { quoted: message });
                return;
            }
        }

        if (isOwnerCommand &&!isOwnerOrSudoCheck) {
            await sock.sendMessage(chatId, { text: box('PERMISSION', '❌ Owner/Sudo Only!') }, { quoted: message });
            return;
        }

        let commandExecuted = false;

        // COMMAND SWITCH
        switch (true) {
            case cmd === '.menu' || cmd === '.help':
                await menuCommand(sock, chatId, message, senderId, settings.prefix);
                commandExecuted = true;
                break;
            case cmd === '.alive':
                await aliveCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.ping':
                await pingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.zimvibes' || cmd === '.zim':
                await zimvibesCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.grpclear':
                await grpclearCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.antidelete':
                await handleAntideleteCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.antimention':
                await antimentionCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.setfullpp':
                await setfullppCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.setbotimage':
                await setbotimageCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.setprefix':
                await setprefixCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.attp':
                await attpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.chatbot':
                await chatbotCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.emojimix':
                await emojimixCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.fact':
                await factCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.igs':
                await igsCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.joke':
                await jokeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.lyrics':
                await lyricsCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.movie':
                await movieCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.truth':
                await truthCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.meme':
                await memeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.mode':
                await modeCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.settings':
                await settingsCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.shorturl':
                await shorturlCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.misc':
                await miscCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.purge':
                await purgeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.ss':
                await handleSsCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.repo':
                await repoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.fork':
                await forkCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.star':
                await starCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.creategp':
                await creategpCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.createchannel':
                await createchannelCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.fakereact':
                await fakereactCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.fakefollow':
                await fakefollowCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.gpfakemember':
                await gpfakememberCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.fakenumbers':
                await fakenumbersCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case cmd === '.fakeaino':
                await fakeainoCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.autoreply':
                await autoreplyCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            case cmd === '.tictactoe' || cmd === '.ttt':
                await tictactoeCommand(sock, chatId, message, senderId);
                commandExecuted = true;
                break;

            // PASTE ALL YOUR OLD CASES HERE
            case cmd === '.kick': await kickCommand(sock, chatId, message); break;
            case cmd === '.ban': await banCommand(sock, chatId, message); break;
            case cmd === '.unban': await unbanCommand(sock, chatId, message); break;
            case cmd === '.promote': await promoteCommand(sock, chatId, message); break;
            case cmd === '.demote': await demoteCommand(sock, chatId, message); break;
            case cmd === '.clear': await clearCommand(sock, chatId, message); break;
            case cmd === '.tagall': await tagAllCommand(sock, chatId, message); break;
            //... keep all your existing cases

            default:
                if (isGroup) {
                    if (userMessage) await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false;
                break;
        }

        if (commandExecuted!== false) await showTypingAfterCommand(sock, chatId);
        if (userMessage.startsWith('.')) await addCommandReaction(sock, message);
    } catch (error) {
        console.error('❌ Error in DARK-EYE V3:', error.message);
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        if (!id.endsWith('@g.us')) return;
        if (action === 'promote') await handlePromotionEvent(sock, id, participants);
        if (action === 'demote') await handleDemotionEvent(sock, id, participants);
        if (action === 'add') await handleJoinEvent(sock, id, participants);
        if (action === 'remove') await handleLeaveEvent(sock, id, participants);
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};
