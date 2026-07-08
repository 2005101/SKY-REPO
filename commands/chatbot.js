const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const settings = require('../settings');

const USER_GROUP_DATA = path.join(__dirname, '../database/chatbot.json');

// In-memory storage for chat history and user info
const chatMemory = {
    messages: new Map(), // Stores last 20 messages per user
    userInfo: new Map() // Stores user information
};

// Load user group data
function loadUserGroupData() {
    try {
        if (!fs.existsSync(path.dirname(USER_GROUP_DATA))) fs.mkdirSync(path.dirname(USER_GROUP_DATA));
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA));
    } catch (error) {
        return { groups: [], chatbot: {} };
    }
}

// Save user group data
function saveUserGroupData(data) {
    try {
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving chatbot data:', error.message);
    }
}

// Random delay 2-5 seconds
function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 2000;
}

// Typing indicator
async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
        await sock.sendPresenceUpdate('paused', chatId);
    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Extract user info
function extractUserInfo(message) {
    const info = {};
    if (message.toLowerCase().includes('my name is')) {
        info.name = message.split('my name is')[1].trim().split(' ')[0];
    }
    if (message.toLowerCase().includes('i am') && message.toLowerCase().includes('years old')) {
        info.age = message.match(/\d+/)?.[0];
    }
    if (message.toLowerCase().includes('i live in') || message.toLowerCase().includes('i am from')) {
        info.location = message.split(/(?:i live in|i am from)/i)[1].trim().split(/[.,!?]/)[0];
    }
    return info;
}

async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: box('CHATBOT', `*DARK-EYE V3 CHATBOT*\n\n*.chatbot on*\nEnable chatbot in this group\n*.chatbot off*\nDisable chatbot in this group`)
        }, { quoted: message });
    }

    const data = loadUserGroupData();
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwnerOrSudo = message.key.fromMe || senderId === settings.owner?.[0] || settings.sudo?.includes(senderId);

    let isAdmin = false;
    if (chatId.endsWith('@g.us')) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            isAdmin = groupMetadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
        } catch {}
    }

    if (!isAdmin &&!isOwnerOrSudo) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: box('PERMISSION', '```Only Group Admins/Owner Can Use This!```')
        }, { quoted: message });
    }

    if (match === 'on') {
        await showTyping(sock, chatId);
        if (data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { text: box('CHATBOT', '*Chatbot is already enabled for this group*') }, { quoted: message });
        }
        data.chatbot[chatId] = true;
        saveUserGroupData(data);
        return sock.sendMessage(chatId, { text: box('CHATBOT', '✅ *CHATBOT ENABLED*\n\nDARK-EYE V3 will now reply when mentioned.') }, { quoted: message });
    }

    if (match === 'off') {
        await showTyping(sock, chatId);
        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { text: box('CHATBOT', '*Chatbot is already disabled for this group*') }, { quoted: message });
        }
        delete data.chatbot[chatId];
        saveUserGroupData(data);
        return sock.sendMessage(chatId, { text: box('CHATBOT', '❌ *CHATBOT DISABLED*') }, { quoted: message });
    }

    await showTyping(sock, chatId);
    return sock.sendMessage(chatId, { text: box('CHATBOT', '*Invalid command. Use.chatbot*') }, { quoted: message });
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();
    if (!data.chatbot[chatId]) return;

    try {
        const botId = sock.user.id;
        const botNumber = botId.split(':')[0];

        let isBotMentioned = false;
        let isReplyToBot = false;

        if (message.message?.extendedTextMessage) {
            const mentionedJid = message.message.extendedTextMessage.contextInfo?.mentionedJid || [];
            const quotedParticipant = message.message.extendedTextMessage.contextInfo?.participant;
            isBotMentioned = mentionedJid.some(jid => jid.includes(botNumber));
            if (quotedParticipant) isReplyToBot = quotedParticipant.includes(botNumber);
        } else if (message.message?.conversation) {
            isBotMentioned = userMessage.includes(`@${botNumber}`);
        }

        if (!isBotMentioned &&!isReplyToBot) return;

        let cleanedMessage = userMessage;
        if (isBotMentioned) cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber}`, 'g'), '').trim();

        // Init memory
        if (!chatMemory.messages.has(senderId)) {
            chatMemory.messages.set(senderId, []);
            chatMemory.userInfo.set(senderId, {});
        }

        // Save user info
        const userInfo = extractUserInfo(cleanedMessage);
        if (Object.keys(userInfo).length > 0) {
            chatMemory.userInfo.set(senderId, {...chatMemory.userInfo.get(senderId),...userInfo });
        }

        // Save message history
        const messages = chatMemory.messages.get(senderId);
        messages.push(cleanedMessage);
        if (messages.length > 20) messages.shift();
        chatMemory.messages.set(senderId, messages);

        await showTyping(sock, chatId);

        // Get AI response
        const response = await getAIResponse(cleanedMessage, {
            messages: chatMemory.messages.get(senderId),
            userInfo: chatMemory.userInfo.get(senderId)
        });

        if (!response) return;

        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));

        await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (error) {
        console.error('❌ Chatbot error:', error.message);
    }
}

async function getAIResponse(userMessage, userContext) {
    try {
        const prompt = `
You are DARK-EYE V3, a real human chatting on WhatsApp.
Name: DARK-EYE V3
Owner: DARK-EYE OFC

Rules:
1. Keep replies short, 1-2 lines
2. Use natural Hinglish + English mix
3. Use real emojis: 😊 😂 😎 🤔
4. Be savage if user is rude, be sweet if user is nice
5. Don't mention you are AI

Chat history: ${userContext.messages.join('\n')}
User info: ${JSON.stringify(userContext.userInfo)}
User: ${userMessage}

Reply:
        `.trim();

        const response = await fetch("https://zellapi.autos/ai/chatbot?text=" + encodeURIComponent(prompt));
        if (!response.ok) throw new Error("API call failed");
        const data = await response.json();
        if (!data.status ||!data.result) throw new Error("Invalid API response");

        return data.result.trim();
    } catch (error) {
        console.error("AI API error:", error);
        return "Abe thoda busy hu yaar 😅 baad me puchna";
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
