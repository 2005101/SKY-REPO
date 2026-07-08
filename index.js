/**
 * DARK-EYE V3 - A WhatsApp Bot
 * Copyright (c) 2025 DARK-EYE TEAM
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 *
 * Credits:
 * - Baileys Library by @whiskeysockets
 * - Converted from Knight Bot
 */
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// Import lightweight store
const store = require('./lib/lightweight_store')

// Initialize store
store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// Memory optimization
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 Garbage collection completed')
    }
}, 60_000)

// Memory monitoring
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...')
        process.exit(1)
    }
}, 30_000)

// ===== DARK-EYE V3 CONFIG =====
let phoneNumber = process.env.PHONE_NUMBER || "263783546271" // Put your number here or use Azure Env
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "DARK-EYE VISION" // CHANGED
global.themeemoji = "👁️" // CHANGED
const pairingCode =!!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// AZURE FIX: No readline. Auto use env or default number
const question = (text) => Promise.resolve(phoneNumber)

async function startDarkEye() { // CHANGED
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const DarkEye = makeWASocket({ // CHANGED
            version,
            logger: pino({ level: 'info' }), // CHANGED to info so we see pair code in logs
            printQRInTerminal:!pairingCode,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid)
                let msg = await store.loadMessage(jid, key.id)
                return msg?.message || ""
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        })

        DarkEye.ev.on('creds.update', saveCreds)
        store.bind(DarkEye.ev)

    // Message handling
    DarkEye.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(DarkEye, chatUpdate);
                return;
            }
            if (!DarkEye.public &&!mek.key.fromMe && chatUpdate.type === 'notify') {
                const isGroup = mek.key?.remoteJid?.endsWith('@g.us')
                if (!isGroup) return
            }
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            if (DarkEye?.msgRetryCounterCache) {
                DarkEye.msgRetryCounterCache.clear()
            }

            try {
                await handleMessages(DarkEye, chatUpdate, true)
            } catch (err) {
                console.error("Error in handleMessages:", err)
                if (mek.key && mek.key.remoteJid) {
                    await DarkEye.sendMessage(mek.key.remoteJid, {
                        text: '❌ An error occurred while processing your message.',
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363161513685998@newsletter',
                                newsletterName: 'DARK-EYE VISION', // CHANGED
                                serverMessageId: -1
                            }
                        }
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Error in messages.upsert:", err)
        }
    })

    DarkEye.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    DarkEye.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = DarkEye.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    DarkEye.getName = (jid, withoutContact = false) => {
        id = DarkEye.decodeJid(jid)
        withoutContact = DarkEye.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = DarkEye.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net'? {
            id,
            name: 'WhatsApp'
        } : id === DarkEye.decodeJid(DarkEye.user.id)?
            DarkEye.user :
            (store.contacts[id] || {})
        return (withoutContact? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    DarkEye.public = true
    DarkEye.serializeM = (m) => smsg(DarkEye, m, store)

    // Handle pairing code - AZURE PROOF
    if (pairingCode &&!DarkEye.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red('Invalid phone number. Use format: 263783546271'))
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await DarkEye.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.bgGreen(` DARK-EYE V3 PAIR CODE : `)), chalk.black(chalk.white(code))) // CHANGED
                console.log(chalk.yellow(`\n1. Open WhatsApp\n2. Settings > Linked Devices\n3. Link with phone number`))
            } catch (error) {
                console.error('Error requesting pairing code:', error)
                console.log(chalk.red('Failed to get pairing code. Check number.'))
            }
        }, 3000)
    }

    // Connection handling
    DarkEye.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s

        if (qr) {
            console.log(chalk.yellow('📱 QR Code generated.'))
        }

        if (connection === 'connecting') {
            console.log(chalk.yellow('🔄 Connecting to WhatsApp...'))
        }

        if (connection == "open") {
            console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(DarkEye.user, null, 2)))

            try {
                const botNumber = DarkEye.user.id.split(':')[0] + '@s.whatsapp.net';
                await DarkEye.sendMessage(botNumber, {
                    text: `🤖 ${global.botname} Connected Successfully!\n\n⏰ Time: ${new Date().toLocaleString()}\n✅ Status: Online and Ready!`, // CHANGED
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'DARK-EYE VISION', // CHANGED
                            serverMessageId: -1
                        }
                    }
                });
            } catch (error) {
                console.error('Error sending connection message:', error.message)
            }

            await delay(1999)
            console.log(chalk.yellow(`\n\n ${chalk.bold.blue(`[ ${global.botname} ]`)}\n\n`)) // CHANGED
            console.log(chalk.cyan(`< ================================================== >`))
            console.log(chalk.magenta(`\n${global.themeemoji} OWNER: ${owner}`)) // CHANGED
            console.log(chalk.magenta(`${global.themeemoji} VERSION: V3`)) // CHANGED
            console.log(chalk.green(`${global.themeemoji} 🤖 Bot Connected Successfully! ✅`))
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode!== DisconnectReason.loggedOut
            const statusCode = lastDisconnect?.error?.output?.statusCode

            console.log(chalk.red(`Connection closed due to ${lastDisconnect?.error}, reconnecting ${shouldReconnect}`))

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                try {
                    rmSync('./session', { recursive: true, force: true })
                    console.log(chalk.yellow('Session folder deleted. Please re-authenticate.'))
                } catch (error) {
                    console.error('Error deleting session:', error)
                }
            }

            if (shouldReconnect) {
                console.log(chalk.yellow('Reconnecting...'))
                await delay(5000)
                startDarkEye() // CHANGED
            }
        }
    })

    const antiCallNotified = new Set();
    DarkEye.ev.on('call', async (calls) => {
        try {
            const { readState: readAnticallState } = require('./commands/anticall');
            const state = readAnticallState();
            if (!state.enabled) return;
            for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    if (typeof DarkEye.rejectCall === 'function' && call.id) {
                        await DarkEye.rejectCall(call.id, callerJid);
                    }
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await DarkEye.sendMessage(callerJid, { text: '📵 Anticall is enabled. Your call was rejected.' });
                    }
                } catch {}
                setTimeout(async () => {
                    try { await DarkEye.updateBlockStatus(callerJid, 'block'); } catch {}
                }, 800);
            }
        } catch (e) {}
    });

    DarkEye.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(DarkEye, update);
    });

    DarkEye.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
            await handleStatus(DarkEye, m);
        }
    });

    DarkEye.ev.on('status.update', async (status) => {
        await handleStatus(DarkEye, status);
    });

    DarkEye.ev.on('messages.reaction', async (status) => {
        await handleStatus(DarkEye, status);
    });

    return DarkEye
    } catch (error) {
        console.error('Error in startDarkEye:', error) // CHANGED
        await delay(5000)
        startDarkEye() // CHANGED
    }
}

startDarkEye().catch(error => { // CHANGED
    console.error('Fatal error:', error)
    process.exit(1)
})
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
