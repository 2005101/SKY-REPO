const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const jimp = require('jimp'); // for watermark

const ANIMU_BASE = 'https://api.some-random-api.com/animu';
const WATERMARK = '> *POWERED BY DARK-EYE OFC*';

function normalizeType(input) {
    const lower = (input || '').toLowerCase();
    if (lower === 'facepalm' || lower === 'face_palm') return 'face-palm';
    if (lower === 'quote' || lower === 'animu-quote' || lower === 'animuquote') return 'quote';
    return lower;
}

function box(title, body) {
    return `╭─❰ 👁️ *${title}* ❱─╮
${body}
╰───────────╯

${WATERMARK}`
}

// Add watermark to image buffer
async function addWatermark(buffer) {
    try {
        const image = await jimp.read(buffer);
        const font = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
        const text = WATERMARK;
        const textWidth = jimp.measureText(font, text);
        const textHeight = jimp.measureTextHeight(font, text, image.bitmap.width);
        
        image.print(
            font,
            10,
            image.bitmap.height - textHeight - 10,
            {
                text: text,
                alignmentX: jimp.HORIZONTAL_ALIGN_LEFT,
            }
        );
        return await image.getBufferAsync(jimp.MIME_JPEG);
    } catch (e) {
        console.log("Watermark error:", e);
        return buffer; // return original if fails
    }
}

async function sendAnimu(sock, chatId, message, type) {
    const endpoint = `${ANIMU_BASE}/${type}`;
    const res = await axios.get(endpoint);
    const data = res.data || {};

    async function convertMediaToSticker(mediaBuffer, isAnimated) {
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const inputExt = isAnimated ? 'gif' : 'jpg';
        const input = path.join(tmpDir, `animu_${Date.now()}.${inputExt}`);
        const output = path.join(tmpDir, `animu_${Date.now()}.webp`);
        fs.writeFileSync(input, mediaBuffer);

        const ffmpegCmd = isAnimated 
            ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 60 -compression_level 6 "${output}"`
            : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${output}"`;

        await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()));
        });

        let webpBuffer = fs.readFileSync(output);

        const img = new webp.Image();
        await img.load(webpBuffer);

        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': 'DARK-EYE ANIME',
            'sticker-pack-publisher': 'DARK-EYE OFC',
            'emojis': ['👁️', '🎌']
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        img.exif = exif;

        const finalBuffer = await img.save(null);

        try { fs.unlinkSync(input); } catch {}
        try { fs.unlinkSync(output); } catch {}
        return finalBuffer;
    }

    if (data.link) {
        const link = data.link;
        const lower = link.toLowerCase();
        const isGifLink = lower.endsWith('.gif');
        const isImageLink = lower.match(/\.(jpg|jpeg|png|webp)$/);

        if (isGifLink || isImageLink) {
            try {
                const resp = await axios.get(link, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const mediaBuf = Buffer.from(resp.data);

                // Add watermark if it's an image, not gif
                let finalBuf = mediaBuf;
                if (!isGifLink) {
                    finalBuf = await addWatermark(mediaBuf);
                }

                const stickerBuf = await convertMediaToSticker(finalBuf, isGifLink);
                await sock.sendMessage(
                    chatId,
                    { sticker: stickerBuf },
                    { quoted: message }
                );
                return;
            } catch (error) {
                console.error('Error converting media to sticker:', error);
            }
        }

        // Fallback to image with watermark
        try {
            const resp = await axios.get(link, { responseType: 'arraybuffer' });
            const watermarked = await addWatermark(Buffer.from(resp.data));
            await sock.sendMessage(
                chatId,
                { image: { url: watermarked }, caption: `anime: ${type}\n\n${WATERMARK}` },
                { quoted: message }
            );
            return;
        } catch {}
    }
    if (data.quote) {
        await sock.sendMessage(
            chatId,
            { text: box(`ANIME QUOTE`, data.quote) },
            { quoted: message }
        );
        return;
    }

    await sock.sendMessage(
        chatId,
        { text: box('DARK-EYE ANIME', '❌ Failed to fetch animu.') },
        { quoted: message }
    );
}

async function animeCommand(sock, chatId, message, args) {
    const subArg = args && args[0] ? args[0] : '';
    const sub = normalizeType(subArg);

    const supported = [
        'nom', 'poke', 'cry', 'kiss', 'pat', 'hug', 'wink', 'face-palm', 'quote'
    ];

    try {
        if (!sub) {
            const helpText = `Usage: .animu <type>\nTypes: ${supported.join(', ')}`;
            await sock.sendMessage(chatId, { text: box('DARK-EYE ANIME', helpText) }, { quoted: message });
            return;
        }

        if (!supported.includes(sub)) {
            await sock.sendMessage(chatId, { text: box('ERROR', `❌ Unsupported type: ${sub}\nTry: ${supported.join(', ')}`) }, { quoted: message });
            return;
        }

        // React
        await sock.sendMessage(chatId, { react: { text: '👁️', key: message.key } });

        await sendAnimu(sock, chatId, message, sub);
    } catch (err) {
        console.error('Error in animu command:', err);
        await sock.sendMessage(chatId, { text: box('DARK-EYE ANIME', '❌ An error occurred while fetching animu.') }, { quoted: message });
    }
}

module.exports = { animeCommand };
