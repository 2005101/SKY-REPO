const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

const jokes = [
    "Why don't skeletons fight each other? They don't have the guts 💀",
    "I told my WiFi we were breaking up. It said 'we have a connection'",
    "Why did the scarecrow win an award? He was outstanding in his field 🌾",
    "What do you call fake spaghetti? An impasta 🍝",
    "Why don't programmers like nature? It has too many bugs 🐛",
    "What did one wall say to the other? I'll meet you at the corner",
    "Why did the coffee file a police report? It got mugged ☕",
    "How does a penguin build its house? Igloos it together 🐧",
    "Why don't eggs tell jokes? They'd crack each other up 🥚",
    "What do you call a bear with no teeth? A gummy bear 🐻",
    "Why did the math book look sad? Too many problems",
    "What do you call cheese that isn't yours? Nacho cheese 🧀",
    "Why can't your nose be 12 inches long? Because then it'd be a foot",
    "What did the ocean say to the beach? Nothing, it waved 🌊",
    "Why don't scientists trust atoms? Because they make up everything"
];

async function jokeCommand(sock, chatId, message, senderId) {
    try {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE JOKE', `😂 ${randomJoke}`)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE joke:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to get joke*')
        }, { quoted: message });
    }
}

module.exports = { jokeCommand };
