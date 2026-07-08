const axios = require('axios');
const settings = require('../settings');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

// Backup facts if API fails
const backupFacts = [
    "A group of flamingos is called a 'flamboyance'",
    "Bananas are berries, but strawberries aren't",
    "Octopuses have 3 hearts",
    "You can't hum while holding your nose",
    "Honey never spoils. 3000 year old honey is still edible",
    "Sharks are older than trees",
    "A day on Venus is longer than a year on Venus",
    "Wombat poop is cube shaped",
    "If you cut an onion underwater, you won't cry",
    "The Eiffel Tower can grow 15cm in summer"
];

async function factCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            text: box('FACT', '*Fetching a random fact...*')
        }, { quoted: message });

        let fact;
        try {
            const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            fact = res.data.text;
        } catch {
            // Use backup if API down
            fact = backupFacts[Math.floor(Math.random() * backupFacts.length)];
        }

        await sock.sendMessage(chatId, {
            text: box('RANDOM FACT', `${fact}`)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE fact command:', error);
        await sock.sendMessage(chatId, {
            text: box('ERROR', '*Failed to fetch fact. Try again!*')
        }, { quoted: message });
    }
}

module.exports = { factCommand };
