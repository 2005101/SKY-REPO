const settings = require('../settings');
const axios = require('axios');

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

> *POWERED BY DARK-EYE OFC*`
}

async function weatherCommand(sock, chatId, message, senderId) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const city = text.split(' ').slice(1).join(' ');

        if (!city) {
            return await sock.sendMessage(chatId, {
                text: box('WEATHER', `*Usage:*.weather <city name>\n*Example:*.weather Harare`)
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: box('DARK-EYE', `*Fetching weather for:* ${city}\nPlease wait 👁️`)
        }, { quoted: message });

        // Free Weather API - OpenWeatherMap
        const API_KEY = 'YOUR_API_KEY'; // Get from openweathermap.org
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const data = res.data;

        const temp = Math.round(data.main.temp);
        const feels = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const wind = data.wind.speed;
        const desc = data.weather[0].description;
        const country = data.sys.country;
        const icon = data.weather[0].main;

        const weatherText = `*Location:* ${data.name}, ${country}
*Weather:* ${icon} - ${desc}
*Temperature:* ${temp}°C
*Feels Like:* ${feels}°C
*Humidity:* ${humidity}%
*Wind Speed:* ${wind} m/s`;

        await sock.sendMessage(chatId, {
            text: box('WEATHER REPORT', weatherText)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in DARK-EYE weather:', error);
        if (error.response?.status === 404) {
            await sock.sendMessage(chatId, {
                text: box('ERROR', '*City not found. Check spelling*')
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: box('ERROR', '*Failed to fetch weather*')
            }, { quoted: message });
        }
    }
}

module.exports = { weatherCommand };
