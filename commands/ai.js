const axios = require('axios');
const fetch = require('node-fetch');

const DARK_EYE_CHANNEL = 'DARK-EYE V3'
const DARK_EYE_LINK = 'https://whatsapp.com/channel/120363422220480'

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: `👁️ *DARK-EYE V3 AI*\n\nPlease provide a question after .gpt or .gemini\n*Example:* .gpt write a basic html code\n╭─❰ ${DARK_EYE_CHANNEL} ❱─╮`
            }, {
                quoted: message
            });
        }

        // Get the command and query
        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: `👁️ *DARK-EYE V3 AI*\n\nPlease provide a question after .gpt or .gemini\n╭─❰ ${DARK_EYE_CHANNEL} ❱─╮`
            }, {quoted:message});
        }

        try {
            // Show processing message
            await sock.sendMessage(chatId, {
                react: { text: '👁️', key: message.key }
            });

            if (command === '.gpt') {
                // Call the GPT API
                const response = await axios.get(`https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`);
                
                if (response.data && response.data.status && response.data.result) {
                    const answer = response.data.result;
                    await sock.sendMessage(chatId, {
                        text: `*DARK-EYE V3 - GPT*\n\n${answer}\n\n_Forwarded from ${DARK_EYE_CHANNEL}_\n${DARK_EYE_LINK}`
                    }, {
                        quoted: message
                    });
                    
                } else {
                    throw new Error('Invalid response from API');
                }
            } else if (command === '.gemini') {
                const apis = [
                    `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                    `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                    `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
                ];

                for (const api of apis) {
                    try {
                        const response = await fetch(api);
                        const data = await response.json();

                        if (data.message || data.data || data.answer || data.result) {
                            const answer = data.message || data.data || data.answer || data.result;
                            await sock.sendMessage(chatId, {
                                text: `*DARK-EYE V3 - GEMINI*\n\n${answer}\n\n_Forwarded from ${DARK_EYE_CHANNEL}_\n${DARK_EYE_LINK}`
                            }, {
                                quoted: message
                            });
                            
                            return;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                throw new Error('All Gemini APIs failed');
            }
        } catch (error) {
            console.error('DARK-EYE AI Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *DARK-EYE V3*\nFailed to get response. Please try again later.\n\n╭─❰ ${DARK_EYE_CHANNEL} ❱─╮`,
                contextInfo: {
                    mentionedJid: [message.key.participant || message.key.remoteJid],
                    quotedMessage: message.message
                }
            }, {
                quoted: message
            });
        }
    } catch (error) {
        console.error('AI Command Error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *DARK-EYE V3*\nAn error occurred. Please try again later.\n\n╭─❰ ${DARK_EYE_CHANNEL} ❱─╮`,
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid],
                quotedMessage: message.message
            }
        }, {
            quoted: message
        });
    }
}

module.exports = aiCommand;
