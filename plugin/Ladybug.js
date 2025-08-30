/**
 * Ladybug Commands Handler v6.8
 * Enhanced WhatsApp Bot with Auto Features
 * Declaring the Glory of Lord Jesus Christ
 * Copyright (c) 2024 MR UNIQUE HACKER
 * "For God so loved the world that he gave his one and only Son" - John 3:16
 */

const fs = require('fs')
const chalk = require('chalk')
const axios = require('axios')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const os = require('os')
const moment = require('moment-timezone')
const path = require('path')

// Load settings and utilities
const settings = require('./settings')
const { getBuffer, fetchJson, runtime, sleep } = require('./lib/myfunc')

// Command prefix
const prefix = settings.prefix || '.'

// Bot info with Christian declaration
const botInfo = {
    name: global.botname || 'LADYBUG BOT',
    version: '6.8',
    developer: 'MR UNIQUE HACKER',
    github: 'https://github.com/mrunqiuehacker',
    youtube: 'MR UNIQUE HACKER',
    declaration: '✝️ In the name of Lord Jesus Christ ✝️',
    verse: 'John 3:16 - For God so loved the world that he gave his one and only Son'
}

// Auto features storage
let autoFeatures = {
    autoReply: new Map(),
    autoSticker: new Set(),
    autoDownload: new Set(),
    autoTranslate: new Map(),
    autoWelcome: new Map(),
    autoLeave: new Map(),
    antiLink: new Set(),
    antiSpam: new Map(),
    autoBackup: true,
    autoUpdate: true
}

// Load auto features from file
const loadAutoFeatures = () => {
    try {
        if (fs.existsSync('./database/autoFeatures.json')) {
            const data = JSON.parse(fs.readFileSync('./database/autoFeatures.json', 'utf8'))
            autoFeatures = { ...autoFeatures, ...data }
        }
    } catch (error) {
        console.log(chalk.yellow('[AUTO] Failed to load auto features'))
    }
}

// Save auto features to file
const saveAutoFeatures = () => {
    try {
        if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true })
        fs.writeFileSync('./database/autoFeatures.json', JSON.stringify(autoFeatures, null, 2))
    } catch (error) {
        console.log(chalk.yellow('[AUTO] Failed to save auto features'))
    }
}

// Enhanced runtime function
function formatRuntime(seconds) {
    seconds = Number(seconds)
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor(seconds % (3600 * 24) / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    
    const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
    
    return dDisplay + hDisplay + mDisplay + sDisplay
}

// System info function
function getSystemInfo() {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    
    return {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        usedMemory: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        freeMemory: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        uptime: formatRuntime(os.uptime()),
        nodeVersion: process.version
    }
}

// Auto Welcome Message
const sendWelcome = async (XeonBotInc, chatId, participants) => {
    try {
        if (!autoFeatures.autoWelcome.has(chatId)) return
        
        const welcomeMsg = `✝️ *WELCOME TO THE GROUP* ✝️\n\n` +
                          `🙏 *"The Lord bless you and keep you"* - Numbers 6:24\n\n` +
                          `👋 Welcome ${participants.map(p => '@' + p.split('@')[0]).join(', ')}\n\n` +
                          `📖 *May God's grace be with you*\n` +
                          `🐞 *Powered by Ladybug v6.8*\n\n` +
                          `${botInfo.declaration}`

        await XeonBotInc.sendMessage(chatId, {
            text: welcomeMsg,
            mentions: participants
        })
    } catch (error) {
        console.log(chalk.red('[AUTO WELCOME ERROR]'), error)
    }
}

// Auto Leave Message
const sendLeave = async (XeonBotInc, chatId, participants) => {
    try {
        if (!autoFeatures.autoLeave.has(chatId)) return
        
        const leaveMsg = `✝️ *FAREWELL MESSAGE* ✝️\n\n` +
                        `👋 Goodbye ${participants.map(p => '@' + p.split('@')[0]).join(', ')}\n\n` +
                        `🙏 *"May the Lord watch between you and me"* - Genesis 31:49\n\n` +
                        `📖 *God bless your journey*\n` +
                        `🐞 *Ladybug v6.8*`

        await XeonBotInc.sendMessage(chatId, {
            text: leaveMsg,
            mentions: participants
        })
    } catch (error) {
        console.log(chalk.red('[AUTO LEAVE ERROR]'), error)
    }
}

// Anti-Link Function
const checkAntiLink = async (XeonBotInc, m) => {
    try {
        if (!autoFeatures.antiLink.has(m.chat)) return false
        
        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|t\.me\/[^\s]+|wa\.me\/[^\s]+)/gi
        if (linkRegex.test(m.text)) {
            await XeonBotInc.sendMessage(m.chat, {
                text: `⚠️ *ANTI-LINK PROTECTION* ⚠️\n\n` +
                      `✝️ *"Be wise as serpents and innocent as doves"* - Matthew 10:16\n\n` +
                      `🚫 Links are not allowed in this group!\n` +
                      `🙏 Please respect the group rules.`
            }, { quoted: m })
            
            // Delete the message if bot is admin
            try {
                await XeonBotInc.sendMessage(m.chat, { delete: m.key })
            } catch {}
            
            return true
        }
        return false
    } catch (error) {
        console.log(chalk.red('[ANTI-LINK ERROR]'), error)
        return false
    }
}

// Auto Sticker Function
const autoStickerHandler = async (XeonBotInc, m) => {
    try {
        if (!autoFeatures.autoSticker.has(m.chat)) return
        if (!/image|video/.test(m.mtype)) return
        
        const media = await m.download()
        await XeonBotInc.sendImageAsSticker(m.chat, media, m, {
            packname: `✝️ ${botInfo.name} v${botInfo.version}`,
            author: `${botInfo.developer}\n${botInfo.declaration}`
        })
    } catch (error) {
        console.log(chalk.red('[AUTO STICKER ERROR]'), error)
    }
}

// Auto Reply Function
const autoReplyHandler = async (XeonBotInc, m) => {
    try {
        const chatReplies = autoFeatures.autoReply.get(m.chat)
        if (!chatReplies) return
        
        const messageText = m.text.toLowerCase()
        for (const [trigger, reply] of chatReplies) {
            if (messageText.includes(trigger.toLowerCase())) {
                await XeonBotInc.sendMessage(m.chat, { text: reply }, { quoted: m })
                break
            }
        }
    } catch (error) {
        console.log(chalk.red('[AUTO REPLY ERROR]'), error)
    }
}

// Auto Backup Function
const performAutoBackup = async () => {
    try {
        if (!autoFeatures.autoBackup) return
        
        const backupDir = './backups'
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
        
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss')
        const backupFile = path.join(backupDir, `ladybug_backup_${timestamp}.json`)
        
        const backupData = {
            timestamp: new Date().toISOString(),
            version: botInfo.version,
            autoFeatures: autoFeatures,
            declaration: botInfo.declaration
        }
        
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
        console.log(chalk.green(`[AUTO BACKUP] ✝️ Backup created: ${backupFile}`))
    } catch (error) {
        console.log(chalk.red('[AUTO BACKUP ERROR]'), error)
    }
}

// Initialize auto features
loadAutoFeatures()

// Auto backup every 6 hours
setInterval(performAutoBackup, 6 * 60 * 60 * 1000)

module.exports = async (XeonBotInc, m, chatUpdate, store) => {
    try {
        // Enhanced message parsing
        const body = (m.mtype === 'conversation') ? m.message.conversation : 
                    (m.mtype === 'imageMessage') ? m.message.imageMessage.caption : 
                    (m.mtype === 'videoMessage') ? m.message.videoMessage.caption : 
                    (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                    (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                    (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                    (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                    (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''

        const budy = (typeof m.text === 'string' ? m.text : '')
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const pushname = m.pushName || "Child of God"
        const botNumber = await XeonBotInc.decodeJid(XeonBotInc.user.id)
        const isOwner = [botNumber, ...settings.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const text = args.join(" ")
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        const isMedia = /image|video|sticker|audio/.test(mime)
        const isGroup = m.chat.endsWith('@g.us')
        const groupMetadata = isGroup ? await XeonBotInc.groupMetadata(m.chat).catch(e => {}) : ''
        const groupName = !isGroup ? '' : groupMetadata.subject
        const participants = !isGroup ? '' : groupMetadata.participants
        const groupAdmins = !isGroup ? '' : participants.filter(v => v.admin !== null).map(v => v.id)
        const isGroupAdmins = !isGroup ? false : groupAdmins.includes(m.sender)
        const isBotAdmins = !isGroup ? false : groupAdmins.includes(botNumber)

        // Handle group events for auto welcome/leave
        if (chatUpdate.participants) {
            if (chatUpdate.action === 'add') {
                await sendWelcome(XeonBotInc, m.chat, chatUpdate.participants)
            } else if (chatUpdate.action === 'remove') {
                await sendLeave(XeonBotInc, m.chat, chatUpdate.participants)
            }
        }

        // Auto features processing (before command processing)
        if (!body.startsWith(prefix)) {
            // Anti-link check
            if (await checkAntiLink(XeonBotInc, m)) return
            
            // Auto reply
            await autoReplyHandler(XeonBotInc, m)
            
            // Auto sticker
            await autoStickerHandler(XeonBotInc, m)
            
            return
        }

        console.log(chalk.blue(`[LADYBUG v6.8] ✝️ Command: ${command} | From: ${pushname} | Chat: ${isGroup ? groupName : 'Private'}`))

        // Enhanced command handlers
        switch (command) {
            case 'ping':
            case 'speed': {
                const timestamp = Date.now()
                const latensi = Date.now() - timestamp
                const neww = performance.now()
                const oldd = performance.now()
                const sysInfo = getSystemInfo()
                
                let responseText = `✝️ *LADYBUG PING v6.8* ✝️\n\n`
                responseText += `🙏 *${botInfo.declaration}*\n`
                responseText += `📖 *${botInfo.verse}*\n\n`
                responseText += `⚡ *Response Time:* ${latensi}ms\n`
                responseText += `💻 *Process Time:* ${(oldd - neww).toFixed(4)}ms\n`
                responseText += `⏱️ *Bot Runtime:* ${formatRuntime(process.uptime())}\n`
                responseText += `🖥️ *System Uptime:* ${sysInfo.uptime}\n`
                responseText += `💾 *Memory Usage:* ${sysInfo.usedMemory}/${sysInfo.totalMemory}\n`
                responseText += `🔧 *Platform:* ${sysInfo.platform} (${sysInfo.arch})\n`
                responseText += `⚙️ *CPU Cores:* ${sysInfo.cpus}\n`
                responseText += `🟢 *Status:* Blessed & Online ✅\n\n`
                responseText += `🐞 *God's blessings through technology*`

                await XeonBotInc.sendMessage(m.chat, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: '✝️ LADYBUG v6.8 - In Jesus Name',
                            serverMessageId: -1
                        },
                        externalAdReply: {
                            title: `✝️ ${botInfo.name} v${botInfo.version}`,
                            body: `${botInfo.declaration}`,
                            thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                            sourceUrl: botInfo.github,
                            mediaType: 1
                        }
                    }
                }, { quoted: m })
                break
            }

            case 'menu':
            case 'help': {
                try {
                    const pushname = m.pushName || m.sender.split('@')[0] || 'Child of God'
                    const currentTime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
                    const currentDate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
                    const sysInfo = getSystemInfo()

                    let menuText = `╭─────「 ✝️ *LADYBUG v6.8* ✝️ 」─────╮\n`
                    menuText += `│ 🙏 *${botInfo.declaration}*\n`
                    menuText += `│ 📖 *${botInfo.verse}*\n`
                    menuText += `│ \n`
                    menuText += `│ 🐞 *Bot:* ${botInfo.name}\n`
                    menuText += `│ 👤 *User:* ${pushname}\n`
                    menuText += `│ 📅 *Date:* ${currentDate}\n`
                    menuText += `│ ⏰ *Time:* ${currentTime} IST\n`
                    menuText += `│ ⏱️ *Uptime:* ${formatRuntime(process.uptime())}\n`
                    menuText += `│ 💾 *RAM:* ${sysInfo.usedMemory}/${sysInfo.totalMemory}\n`
                    menuText += `│ 🔧 *Version:* ${botInfo.version}\n`
                    menuText += `╰─────────────────────────────────╯\n\n`
                    
                    menuText += `┌─⊷ ✝️ *CHRISTIAN COMMANDS*\n`
                    menuText += `│• ${prefix}verse - Daily Bible verse\n`
                    menuText += `│• ${prefix}prayer - Prayer request\n`
                    menuText += `│• ${prefix}blessing - Get blessed\n`
                    menuText += `│• ${prefix}psalm - Random Psalm\n`
                    menuText += `│• ${prefix}faith - Faith encouragement\n`
                    menuText += `│• ${prefix}worship - Worship songs\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *GENERAL COMMANDS*\n`
                    menuText += `│• ${prefix}ping - Enhanced system status\n`
                    menuText += `│• ${prefix}menu - Show this menu\n`
                    menuText += `│• ${prefix}runtime - Bot uptime info\n`
                    menuText += `│• ${prefix}owner - Owner information\n`
                    menuText += `│• ${prefix}script - Bot script details\n`
                    menuText += `│• ${prefix}system - System information\n`
                    menuText += `│• ${prefix}status - Bot status check\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ 🤖 *AUTO FEATURES*\n`
                    menuText += `│• ${prefix}autoreply - Auto reply setup\n`
                    menuText += `│• ${prefix}autosticker - Auto sticker mode\n`
                    menuText += `│• ${prefix}autowelcome - Auto welcome\n`
                    menuText += `│• ${prefix}autoleave - Auto leave message\n`
                    menuText += `│• ${prefix}antilink - Anti-link protection\n`
                    menuText += `│• ${prefix}autobackup - Auto backup system\n`
                    menuText += `│• ${prefix}autostatus - Check auto features\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *YOUTUBE COMMANDS*\n`
                    menuText += `│• ${prefix}yts <query> - YouTube search\n`
                    menuText += `│• ${prefix}play <song> - Download audio\n`
                    menuText += `│• ${prefix}song <title> - Download music\n`
                    menuText += `│• ${prefix}video <title> - Download video\n`
                    menuText += `│• ${prefix}ytmp4 <title> - Download MP4\n`
                    menuText += `│• ${prefix}ytinfo <url> - Video information\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *ANIME COMMANDS*\n`
                    menuText += `│• ${prefix}anime <category> - Anime images\n`
                    menuText += `│• ${prefix}waifu - Random waifu\n`
                    menuText += `│• ${prefix}neko - Random neko\n`
                    menuText += `│• ${prefix}animepic <type> - Anime pics\n`
                    menuText += `│• ${prefix}manga <title> - Manga search\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *AI COMMANDS* 🤖\n`
                    menuText += `│• ${prefix}ai <question> - AI assistant\n`
                    menuText += `│• ${prefix}gpt <prompt> - ChatGPT response\n`
                    menuText += `│• ${prefix}bard <query> - Google Bard\n`
                    menuText += `│• ${prefix}imagine <prompt> - AI image\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *FUN COMMANDS*\n`
                    menuText += `│• ${prefix}joke - Random joke\n`
                    menuText += `│• ${prefix}quote - Inspirational quote\n`
                    menuText += `│• ${prefix}fact - Random fact\n`
                    menuText += `│• ${prefix}meme - Random meme\n`
                    menuText += `│• ${prefix}truth - Truth question\n`
                    menuText += `│• ${prefix}dare - Dare challenge\n`
                    menuText += `│• ${prefix}roast - Roast generator\n`
                    menuText += `│• ${prefix}pickup - Pickup line\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *UTILITY COMMANDS*\n`
                    menuText += `│• ${prefix}weather <city> - Weather info\n`
                    menuText += `│• ${prefix}translate <text> - Translate text\n`
                    menuText += `│• ${prefix}qr <text> - Generate QR code\n`
                    menuText += `│• ${prefix}shorturl <url> - Shorten URL\n`
                    menuText += `│• ${prefix}calculator <math> - Calculate\n`
                    menuText += `│• ${prefix}base64 <text> - Encode/decode\n`
                    menuText += `│• ${prefix}hash <text> - Generate hash\n`
                    menuText += `│• ${prefix}password <length> - Generate password\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *MEDIA COMMANDS*\n`
                    menuText += `│• ${prefix}sticker - Create sticker\n`
                    menuText += `│• ${prefix}toimg - Sticker to image\n`
                    menuText += `│• ${prefix}tovideo - Image to video\n`
                    menuText += `│• ${prefix}toaudio - Video to audio\n`
                    menuText += `│• ${prefix}removebg - Remove background\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *GROUP COMMANDS*\n`
                    menuText += `│• ${prefix}groupinfo - Group information\n`
                    menuText += `│• ${prefix}tagall - Tag all members\n`
                    menuText += `│• ${prefix}hidetag - Hidden tag\n`
                    menuText += `│• ${prefix}kick @user - Remove member\n`
                    menuText += `│• ${prefix}promote @user - Make admin\n`
                    menuText += `│• ${prefix}demote @user - Remove admin\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `┌─⊷ *OWNER COMMANDS*\n`
                    menuText += `│• ${prefix}restart - Restart bot\n`
                    menuText += `│• ${prefix}eval - Execute code\n`
                    menuText += `│• ${prefix}exec - Execute terminal\n`
                    menuText += `│• ${prefix}broadcast - Send to all\n`
                    menuText += `│• ${prefix}block - Block user\n`
                    menuText += `│• ${prefix}unblock - Unblock user\n`
                    menuText += `│• ${prefix}setpp - Set bot profile\n`
                    menuText += `│• ${prefix}setname - Set bot name\n`
                    menuText += `└────────────⊷\n\n`
                    
                    menuText += `✝️ *${botInfo.declaration}*\n`
                    menuText += `📊 *Total Commands:* 60+\n`
                    menuText += `🤖 *Auto Features:* 8 Active\n`
                    menuText += `🐞 *Powered by Ladybug v6.8*\n`
                    menuText += `💻 *Developer:* ${botInfo.developer}\n`
                    menuText += `🌐 *GitHub:* ${botInfo.github}\n`
                    menuText += `📺 *YouTube:* ${botInfo.youtube}\n\n`
                    menuText += `🙏 *"I can do all things through Christ who strengthens me" - Philippians 4:13*`

                    // Send menu with enhanced context
                    await XeonBotInc.sendMessage(m.chat, {
                        text: menuText,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363161513685998@newsletter',
                                newsletterName: '✝️ Ladybug v6.8 - Christian Bot Menu',
                                serverMessageId: -1
                            },
                            externalAdReply: {
                                title: `✝️ ${botInfo.name} v${botInfo.version}`,
                                body: `${botInfo.declaration} - 60+ Commands + Auto Features`,
                                thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                                sourceUrl: botInfo.github,
                                mediaType: 1,
                                mediaUrl: botInfo.github
                            }
                        }
                    }, { quoted: m })

                } catch (error) {
                    console.error('Menu command error:', error)
                    
                    // Fallback simple menu
                    const simpleMenu = `✝️ *LADYBUG BOT v6.8* ✝️\n\n` +
                                      `🙏 *${botInfo.declaration}*\n\n` +
                                      `📋 *Available Commands:*\n` +
                                      `• ${prefix}ping - Check speed\n` +
                                      `• ${prefix}menu - Show menu\n` +
                                      `• ${prefix}verse - Bible verse\n` +
                                      `• ${prefix}autostatus - Auto features\n` +
                                      `• ${prefix}owner - Owner info\n\n` +
                                      `⚡ Bot is blessed & running!\n` +
                                      `💻 Developer: ${botInfo.developer}`

                    await XeonBotInc.sendMessage(m.chat, { text: simpleMenu }, { quoted: m })
                }
                break
            }

            // Christian Commands
            case 'verse':
            case 'bibleverse': {
                try {
                    const verses = [
                        "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. - John 3:16",
                        "I can do all this through him who gives me strength. - Philippians 4:13",
                        "Trust in the Lord with all your heart and lean not on your own understanding. - Proverbs 3:5",
                        "The Lord is my shepherd, I lack nothing. - Psalm 23:1",
                        "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. - Joshua 1:9",
                        "And we know that in all things God works for the good of those who love him. - Romans 8:28",
                        "Cast all your anxiety on him because he cares for you. - 1 Peter 5:7",
                        "The Lord your God is with you, the Mighty Warrior who saves. - Zephaniah 3:17"
                    ]
                    
                    const randomVerse = verses[Math.floor(Math.random() * verses.length)]
                    
                    let verseText = `✝️ *DAILY BIBLE VERSE* ✝️\n\n`
                    verseText += `📖 *${randomVerse}*\n\n`
                    verseText += `🙏 *May this verse bless your day*\n`
                    verseText += `💝 *God loves you unconditionally*\n\n`
                    verseText += `🐞 *Ladybug v6.8 - Spreading God's Word*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: verseText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get Bible verse' }, { quoted: m })
                }
                break
            }

            case 'prayer': {
                try {
                    const prayers = [
                        "Heavenly Father, we come before you with grateful hearts. Bless this person with your love, peace, and guidance. In Jesus' name, Amen.",
                        "Lord Jesus, thank you for your sacrifice on the cross. Please watch over this person and fill their life with your joy and purpose. Amen.",
                        "Dear God, grant this person wisdom in their decisions, strength in their challenges, and peace in their heart. We trust in your perfect plan. Amen.",
                        "Father, we pray for protection, provision, and your presence in this person's life. May they feel your love surrounding them today. Amen.",
                        "Lord, bless this person with good health, meaningful relationships, and opportunities to serve you. Guide their steps according to your will. Amen."
                    ]
                    

                    const randomPrayer = prayers[Math.floor(Math.random() * prayers.length)]
                    
                    let prayerText = `🙏 *PRAYER FOR YOU* 🙏\n\n`
                    prayerText += `✝️ *${randomPrayer}*\n\n`
                    prayerText += `💝 *You are loved and blessed*\n`
                    prayerText += `🕊️ *May God's peace be with you*\n\n`
                    prayerText += `🐞 *Ladybug v6.8 - Praying for you*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: prayerText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to send prayer' }, { quoted: m })
                }
                break
            }

            case 'blessing': {
                try {
                    const blessings = [
                        "May the Lord bless you and keep you; may the Lord make his face shine on you and be gracious to you. - Numbers 6:24-25",
                        "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing. - Zephaniah 3:17",
                        "May God give you heaven's dew and earth's richness—an abundance of grain and new wine. - Genesis 27:28",
                        "The Lord will open the heavens, the storehouse of his bounty, to send rain on your land in season and to bless all the work of your hands. - Deuteronomy 28:12",
                        "May you be blessed by the Lord, the Maker of heaven and earth. - Psalm 115:15"
                    ]
                    
                    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)]
                    
                    let blessingText = `✨ *BLESSING FROM HEAVEN* ✨\n\n`
                    blessingText += `🙏 *${randomBlessing}*\n\n`
                    blessingText += `💫 *You are blessed beyond measure*\n`
                    blessingText += `🌟 *God's favor is upon you*\n\n`
                    blessingText += `🐞 *Ladybug v6.8 - Blessing you today*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: blessingText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to send blessing' }, { quoted: m })
                }
                break
            }

            case 'psalm': {
                try {
                    const psalms = [
                        "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters. - Psalm 23:1-2",
                        "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth. - Psalm 121:1-2",
                        "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid? - Psalm 27:1",
                        "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth. - Psalm 46:10",
                        "Taste and see that the Lord is good; blessed is the one who takes refuge in him. - Psalm 34:8"
                    ]
                    
                    const randomPsalm = psalms[Math.floor(Math.random() * psalms.length)]
                    
                    let psalmText = `📜 *PSALM OF THE DAY* 📜\n\n`
                    psalmText += `🎵 *${randomPsalm}*\n\n`
                    psalmText += `🎶 *Let your heart sing with praise*\n`
                    psalmText += `💖 *God's love endures forever*\n\n`
                    psalmText += `🐞 *Ladybug v6.8 - Psalms of praise*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: psalmText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get psalm' }, { quoted: m })
                }
                break
            }

            case 'faith': {
                try {
                    const faithMessages = [
                        "Faith is confidence in what we hope for and assurance about what we do not see. - Hebrews 11:1",
                        "If you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move. - Matthew 17:20",
                        "And without faith it is impossible to please God, because anyone who comes to him must believe that he exists. - Hebrews 11:6",
                        "For we live by faith, not by sight. - 2 Corinthians 5:7",
                        "But when you ask, you must believe and not doubt, because the one who doubts is like a wave of the sea. - James 1:6"
                    ]
                    
                    const randomFaith = faithMessages[Math.floor(Math.random() * faithMessages.length)]
                    
                    let faithText = `💪 *FAITH ENCOURAGEMENT* 💪\n\n`
                    faithText += `✝️ *${randomFaith}*\n\n`
                    faithText += `🔥 *Your faith can move mountains*\n`
                    faithText += `⭐ *Trust in God's perfect timing*\n`
                    faithText += `🌈 *Miracles are coming your way*\n\n`
                    faithText += `🐞 *Ladybug v6.8 - Building your faith*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: faithText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to send faith message' }, { quoted: m })
                }
                break
            }

            case 'worship': {
                try {
                    const worshipSongs = [
                        "🎵 Amazing Grace - How sweet the sound that saved a wretch like me",
                        "🎵 How Great Thou Art - Then sings my soul, my Savior God to Thee",
                        "🎵 Blessed Assurance - Jesus is mine, oh what a foretaste of glory divine",
                        "🎵 Great is Thy Faithfulness - Morning by morning new mercies I see",
                        "🎵 Holy, Holy, Holy - Lord God Almighty, early in the morning our song shall rise to Thee"
                    ]
                    
                    const randomWorship = worshipSongs[Math.floor(Math.random() * worshipSongs.length)]
                    
                    let worshipText = `🎼 *WORSHIP TIME* 🎼\n\n`
                    worshipText += `${randomWorship}\n\n`
                    worshipText += `🙌 *Lift your hands in praise*\n`
                    worshipText += `💝 *God inhabits the praises of His people*\n`
                    worshipText += `🎶 *Let everything that has breath praise the Lord*\n\n`
                    worshipText += `🐞 *Ladybug v6.8 - Worship and praise*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: worshipText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to send worship song' }, { quoted: m })
                }
                break
            }

            // Auto Features Commands
            case 'autostatus': {
                try {
                    let statusText = `🤖 *AUTO FEATURES STATUS* 🤖\n\n`
                    statusText += `✝️ *${botInfo.declaration}*\n\n`
                    statusText += `📊 *Current Status:*\n\n`
                    statusText += `🔄 *Auto Reply:* ${autoFeatures.autoReply.size} chats\n`
                    statusText += `🎯 *Auto Sticker:* ${autoFeatures.autoSticker.size} chats\n`
                    statusText += `👋 *Auto Welcome:* ${autoFeatures.autoWelcome.size} groups\n`
                    statusText += `👋 *Auto Leave:* ${autoFeatures.autoLeave.size} groups\n`
                    statusText += `🚫 *Anti Link:* ${autoFeatures.antiLink.size} groups\n`
                    statusText += `💾 *Auto Backup:* ${autoFeatures.autoBackup ? '✅ Enabled' : '❌ Disabled'}\n`
                    statusText += `🔄 *Auto Update:* ${autoFeatures.autoUpdate ? '✅ Enabled' : '❌ Disabled'}\n\n`
                    statusText += `🐞 *Ladybug v6.8 - Auto Features Active*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: statusText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get auto status' }, { quoted: m })
                }
                break
            }

            case 'autoreply': {
                if (!isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only group admins can use this command!' }, { quoted: m })
                }
                
                try {
                    if (!text) {
                        let replyText = `🔄 *AUTO REPLY SETUP* 🔄\n\n`
                        replyText += `📝 *Usage:*\n`
                        replyText += `• ${prefix}autoreply on - Enable auto reply\n`
                        replyText += `• ${prefix}autoreply off - Disable auto reply\n`
                        replyText += `• ${prefix}autoreply add <trigger>|<reply> - Add reply\n`
                        replyText += `• ${prefix}autoreply list - Show all replies\n`
                        replyText += `• ${prefix}autoreply remove <trigger> - Remove reply\n\n`
                        replyText += `💡 *Example:* ${prefix}autoreply add hello|Hello! God bless you!`
                        
                        await XeonBotInc.sendMessage(m.chat, { text: replyText }, { quoted: m })
                        return
                    }
                    
                    const [action, ...params] = text.split(' ')
                    
                    if (action === 'on') {
                        if (!autoFeatures.autoReply.has(m.chat)) {
                            autoFeatures.autoReply.set(m.chat, new Map())
                        }
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '✅ Auto reply enabled for this chat!' }, { quoted: m })
                    } else if (action === 'off') {
                        autoFeatures.autoReply.delete(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto reply disabled for this chat!' }, { quoted: m })
                    } else if (action === 'add') {
                        const replyData = params.join(' ').split('|')
                        if (replyData.length !== 2) {
                            return await XeonBotInc.sendMessage(m.chat, { text: '❌ Format: trigger|reply' }, { quoted: m })
                        }
                        
                        if (!autoFeatures.autoReply.has(m.chat)) {
                            autoFeatures.autoReply.set(m.chat, new Map())
                        }
                        
                        autoFeatures.autoReply.get(m.chat).set(replyData[0].trim(), replyData[1].trim())
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: `✅ Auto reply added: "${replyData[0].trim()}" → "${replyData[1].trim()}"` }, { quoted: m })
                    } else if (action === 'list') {
                        const chatReplies = autoFeatures.autoReply.get(m.chat)
                        if (!chatReplies || chatReplies.size === 0) {
                            return await XeonBotInc.sendMessage(m.chat, { text: '📝 No auto replies set for this chat' }, { quoted: m })
                        }
                        
                        let listText = `📋 *AUTO REPLY LIST* 📋\n\n`
                        let index = 1
                        for (const [trigger, reply] of chatReplies) {
                            listText += `${index}. "${trigger}" → "${reply}"\n`
                            index++
                        }
                        
                        await XeonBotInc.sendMessage(m.chat, { text: listText }, { quoted: m })
                    } else if (action === 'remove') {
                        const trigger = params.join(' ')
                        const chatReplies = autoFeatures.autoReply.get(m.chat)
                        
                        if (!chatReplies || !chatReplies.has(trigger)) {
                            return await XeonBotInc.sendMessage(m.chat, { text: '❌ Trigger not found!' }, { quoted: m })
                        }
                        
                        chatReplies.delete(trigger)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: `✅ Auto reply removed: "${trigger}"` }, { quoted: m })
                    }
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto reply command failed' }, { quoted: m })
                }
                break
            }

            case 'autosticker': {
                if (!isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only group admins can use this command!' }, { quoted: m })
                }
                
                try {
                    if (autoFeatures.autoSticker.has(m.chat)) {
                        autoFeatures.autoSticker.delete(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto sticker disabled for this chat!' }, { quoted: m })
                    } else {
                        autoFeatures.autoSticker.add(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '✅ Auto sticker enabled! All images/videos will be converted to stickers.' }, { quoted: m })
                    }
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto sticker command failed' }, { quoted: m })
                }
                break
            }

            case 'autowelcome': {
                if (!isGroup) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for groups!' }, { quoted: m })
                }
                
                if (!isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only group admins can use this command!' }, { quoted: m })
                }
                
                try {
                    if (autoFeatures.autoWelcome.has(m.chat)) {
                        autoFeatures.autoWelcome.delete(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto welcome disabled for this group!' }, { quoted: m })
                    } else {
                        autoFeatures.autoWelcome.set(m.chat, true)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '✅ Auto welcome enabled! New members will receive a blessed welcome message.' }, { quoted: m })
                    }
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto welcome command failed' }, { quoted: m })
                }
                break
            }

            case 'autoleave': {
                if (!isGroup) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for groups!' }, { quoted: m })
                }
                
                if (!isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only group admins can use this command!' }, { quoted: m })
                }
                
                try {
                    if (autoFeatures.autoLeave.has(m.chat)) {
                        autoFeatures.autoLeave.delete(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto leave message disabled for this group!' }, { quoted: m })
                    } else {
                        autoFeatures.autoLeave.set(m.chat, true)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '✅ Auto leave message enabled! Departing members will receive a farewell blessing.' }, { quoted: m })
                    }
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto leave command failed' }, { quoted: m })
                }
                break
            }

            case 'antilink': {
                if (!isGroup) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for groups!' }, { quoted: m })
                }
                
                if (!isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only group admins can use this command!' }, { quoted: m })
                }
                
                try {
                    if (autoFeatures.antiLink.has(m.chat)) {
                        autoFeatures.antiLink.delete(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Anti-link protection disabled for this group!' }, { quoted: m })
                    } else {
                        autoFeatures.antiLink.add(m.chat)
                        saveAutoFeatures()
                        await XeonBotInc.sendMessage(m.chat, { text: '✅ Anti-link protection enabled! Links will be automatically detected and removed.' }, { quoted: m })
                    }
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Anti-link command failed' }, { quoted: m })
                }
                break
            }

            case 'autobackup': {
                if (!isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only owner can use this command!' }, { quoted: m })
                }
                
                try {
                    autoFeatures.autoBackup = !autoFeatures.autoBackup
                    saveAutoFeatures()
                    
                    if (autoFeatures.autoBackup) {
                        await XeonBotInc.sendMessage(m.chat, { text: '✅ Auto backup enabled! Bot data will be backed up every 6 hours.' }, { quoted: m })
                        // Perform immediate backup
                        await performAutoBackup()
                    } else {
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto backup disabled!' }, { quoted: m })
                    }
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Auto backup command failed' }, { quoted: m })
                }
                break
            }

            // General Commands
            case 'runtime': {
                try {
                    const uptime = formatRuntime(process.uptime())
                    const sysUptime = formatRuntime(os.uptime())
                    
                    let runtimeText = `⏱️ *RUNTIME INFORMATION* ⏱️\n\n`
                    runtimeText += `✝️ *${botInfo.declaration}*\n\n`
                    runtimeText += `🤖 *Bot Runtime:* ${uptime}\n`
                    runtimeText += `🖥️ *System Uptime:* ${sysUptime}\n`
                    runtimeText += `📅 *Started:* ${moment().subtract(process.uptime(), 'seconds').format('DD/MM/YYYY HH:mm:ss')}\n`
                    runtimeText += `🌍 *Timezone:* Asia/Kolkata (IST)\n`
                    runtimeText += `⚡ *Status:* Blessed & Running ✅\n\n`
                    runtimeText += `🐞 *Ladybug v6.8 - Always faithful*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: runtimeText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get runtime info' }, { quoted: m })
                }
                break
            }

            case 'owner': {
                try {
                    let ownerText = `👑 *BOT OWNER INFORMATION* 👑\n\n`
                    ownerText += `✝️ *${botInfo.declaration}*\n\n`
                    ownerText += `👤 *Developer:* ${botInfo.developer}\n`
                    ownerText += `🐞 *Bot:* ${botInfo.name} v${botInfo.version}\n`
                    ownerText += `🌐 *GitHub:* ${botInfo.github}\n`
                    ownerText += `📺 *YouTube:* ${botInfo.youtube}\n`
                    ownerText += `📧 *Contact:* wa.me/message\n\n`
                    ownerText += `🙏 *"Give thanks to the Lord, for he is good"* - Psalm 107:1\n\n`
                    ownerText += `💻 *Developed with love and faith*\n`
                    ownerText += `🐞 *Ladybug v6.8 - God's blessings in code*`
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: ownerText,
                        contextInfo: {
                            externalAdReply: {
                                title: `${botInfo.developer}`,
                                body: `${botInfo.declaration}`,
                                thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                                sourceUrl: botInfo.github,
                                mediaType: 1
                            }
                        }
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get owner info' }, { quoted: m })
                }
                break
            }

            case 'script':
            case 'sc': {
                try {
                    let scriptText = `📜 *LADYBUG SCRIPT v6.8* 📜\n\n`
                    scriptText += `✝️ *${botInfo.declaration}*\n\n`
                    scriptText += `🐞 *Bot Name:* ${botInfo.name}\n`
                    scriptText += `🔢 *Version:* ${botInfo.version}\n`
                    scriptText += `👨‍💻 *Developer:* ${botInfo.developer}\n`
                    scriptText += `🌐 *Repository:* ${botInfo.github}\n`
                    scriptText += `📺 *YouTube:* ${botInfo.youtube}\n\n`
                    scriptText += `⚡ *Features:*\n`
                    scriptText += `• 60+ Commands\n`
                    scriptText += `• 8 Auto Features\n`
                    scriptText += `• Christian Integration\n`
                    scriptText += `• Multi-platform Support\n`
                    scriptText += `• Advanced Error Handling\n`
                    scriptText += `• Auto Backup System\n\n`
                    scriptText += `🙏 *"Every good and perfect gift is from above"* - James 1:17\n\n`
                    scriptText += `🐞 *Free & Open Source - God's blessings for all*`
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: scriptText,
                        contextInfo: {
                            externalAdReply: {
                                title: `✝️ ${botInfo.name} v${botInfo.version}`,
                                body: `Free WhatsApp Bot Script - ${botInfo.declaration}`,
                                thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                                sourceUrl: botInfo.github,
                                mediaType: 1
                            }
                        }
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get script info' }, { quoted: m })
                }
                break
            }

            case 'system': {
                try {
                    const sysInfo = getSystemInfo()
                    
                    let systemText = `🖥️ *SYSTEM INFORMATION* 🖥️\n\n`
                    systemText += `✝️ *${botInfo.declaration}*\n\n`
                    systemText += `💻 *Platform:* ${sysInfo.platform}\n`
                    systemText += `🏗️ *Architecture:* ${sysInfo.arch}\n`
                    systemText += `⚙️ *CPU Cores:* ${sysInfo.cpus}\n`
                    systemText += `💾 *Total Memory:* ${sysInfo.totalMemory}\n`
                    systemText += `📊 *Used Memory:* ${sysInfo.usedMemory}\n`
                    systemText += `🆓 *Free Memory:* ${sysInfo.freeMemory}\n`
                    systemText += `⏱️ *System Uptime:* ${sysInfo.uptime}\n`
                    systemText += `🟢 *Node Version:* ${sysInfo.nodeVersion}\n`
                    systemText += `🐞 *Bot Version:* v${botInfo.version}\n\n`
                    systemText += `🙏 *"The earth is the Lord's, and everything in it"* - Psalm 24:1`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: systemText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get system info' }, { quoted: m })
                }
                break
            }

            case 'status': {
                try {
                    const sysInfo = getSystemInfo()
                    const memoryUsage = process.memoryUsage()
                    
                    let statusText = `📊 *BOT STATUS CHECK* 📊\n\n`
                    statusText += `✝️ *${botInfo.declaration}*\n\n`
                    statusText += `🟢 *Status:* Online & Blessed ✅\n`
                    statusText += `⏱️ *Uptime:* ${formatRuntime(process.uptime())}\n`
                    statusText += `💾 *Memory Usage:* ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`
                    statusText += `📈 *Heap Total:* ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\n`
                    statusText += `🔄 *Auto Features:* ${autoFeatures.autoReply.size + autoFeatures.autoSticker.size + autoFeatures.autoWelcome.size} Active\n`
                    statusText += `🤖 *Commands:* 60+ Available\n`
                    statusText += `🌐 *Platform:* ${sysInfo.platform}\n`
                    statusText += `⚡ *Performance:* Excellent\n\n`
                    statusText += `🙏 *"The Lord watches over you"* - Psalm 121:5\n\n`
                    statusText += `🐞 *Ladybug v6.8 - Serving faithfully*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: statusText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get status info' }, { quoted: m })
                }
                break
            }

            // Owner Commands
            case 'restart': {
                if (!isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only owner can use this command!' }, { quoted: m })
                }
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `🔄 *RESTARTING BOT* 🔄\n\n✝️ *${botInfo.declaration}*\n\n🙏 *"He makes all things new"* - Revelation 21:5\n\n🐞 *Ladybug v6.8 will be back shortly...*` 
                    }, { quoted: m })
                    
                    // Save auto features before restart
                    saveAutoFeatures()
                    
                    // Restart process
                    process.exit(1)
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to restart bot' }, { quoted: m })
                }
                break
            }

            case 'eval': {
                if (!isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only owner can use this command!' }, { quoted: m })
                }
                
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide code to evaluate' }, { quoted: m })
                }
                
                try {
                    let evaled = await eval(text)
                                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                    
                    let evalText = `📝 *EVAL RESULT* 📝\n\n`
                    evalText += `✝️ *${botInfo.declaration}*\n\n`
                    evalText += `💻 *Input:*\n\`\`\`${text}\`\`\`\n\n`
                    evalText += `📤 *Output:*\n\`\`\`${evaled}\`\`\`\n\n`
                    evalText += `🐞 *Ladybug v6.8 - Code executed successfully*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: evalText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `❌ *EVAL ERROR*\n\n\`\`\`${error.message}\`\`\`` 
                    }, { quoted: m })
                }
                break
            }

            case 'exec': {
                if (!isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only owner can use this command!' }, { quoted: m })
                }
                
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide command to execute' }, { quoted: m })
                }
                
                try {
                    const { stdout, stderr } = await execAsync(text)
                    
                    let execText = `⚡ *EXEC RESULT* ⚡\n\n`
                    execText += `✝️ *${botInfo.declaration}*\n\n`
                    execText += `💻 *Command:*\n\`\`\`${text}\`\`\`\n\n`
                    
                    if (stdout) {
                        execText += `📤 *Output:*\n\`\`\`${stdout}\`\`\`\n\n`
                    }
                    
                    if (stderr) {
                        execText += `⚠️ *Error:*\n\`\`\`${stderr}\`\`\`\n\n`
                    }
                    
                    execText += `🐞 *Ladybug v6.8 - Command executed*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: execText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `❌ *EXEC ERROR*\n\n\`\`\`${error.message}\`\`\`` 
                    }, { quoted: m })
                }
                break
            }

            case 'broadcast': {
                if (!isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only owner can use this command!' }, { quoted: m })
                }
                
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide message to broadcast' }, { quoted: m })
                }
                
                try {
                    const broadcastMsg = `📢 *BROADCAST MESSAGE* 📢\n\n` +
                                       `✝️ *${botInfo.declaration}*\n\n` +
                                       `${text}\n\n` +
                                       `🐞 *Ladybug v6.8 - Official Broadcast*`
                    
                    // Get all chats
                    const chats = store.chats.all()
                    let successCount = 0
                    let failCount = 0
                    
                    await XeonBotInc.sendMessage(m.chat, { text: `🔄 Broadcasting to ${chats.length} chats...` }, { quoted: m })
                    
                    for (const chat of chats) {
                        try {
                            await XeonBotInc.sendMessage(chat.id, { text: broadcastMsg })
                            successCount++
                            await sleep(1000) // 1 second delay
                        } catch {
                            failCount++
                        }
                    }
                    
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `✅ Broadcast completed!\n📤 Success: ${successCount}\n❌ Failed: ${failCount}` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Broadcast failed' }, { quoted: m })
                }
                break
            }

            // Fun Commands
            case 'joke': {
                try {
                    const jokes = [
                        "Why don't scientists trust atoms? Because they make up everything! 😄",
                        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
                        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
                        "What do you call a fake noodle? An impasta! 🍝",
                        "Why did the math book look so sad? Because it had too many problems! 📚",
                        "What do you call a bear with no teeth? A gummy bear! 🐻",
                        "Why don't skeletons fight each other? They don't have the guts! 💀",
                        "What's orange and sounds like a parrot? A carrot! 🥕"
                    ]
                    
                    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
                    
                    let jokeText = `😂 *JOKE TIME* 😂\n\n`
                    jokeText += `${randomJoke}\n\n`
                    jokeText += `🙏 *"A cheerful heart is good medicine"* - Proverbs 17:22\n\n`
                    jokeText += `🐞 *Ladybug v6.8 - Spreading joy and laughter*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: jokeText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get joke' }, { quoted: m })
                }
                break
            }

            case 'quote': {
                try {
                    const quotes = [
                        "The only way to do great work is to love what you do. - Steve Jobs",
                        "Life is what happens to you while you're busy making other plans. - John Lennon",
                        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                        "It is during our darkest moments that we must focus to see the light. - Aristotle",
                        "The only impossible journey is the one you never begin. - Tony Robbins",
                        "In the end, we will remember not the words of our enemies, but the silence of our friends. - Martin Luther King Jr.",
                        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
                        "The way to get started is to quit talking and begin doing. - Walt Disney"
                    ]
                    
                    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
                    
                    let quoteText = `💭 *INSPIRATIONAL QUOTE* 💭\n\n`
                    quoteText += `"${randomQuote}"\n\n`
                    quoteText += `✨ *Let this inspire your day*\n`
                    quoteText += `🙏 *God has great plans for you*\n\n`
                    quoteText += `🐞 *Ladybug v6.8 - Daily inspiration*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: quoteText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get quote' }, { quoted: m })
                }
                break
            }

            case 'fact': {
                try {
                    const facts = [
                        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old! 🍯",
                        "A group of flamingos is called a 'flamboyance'. How fitting! 🦩",
                        "Octopuses have three hearts and blue blood! 🐙",
                        "Bananas are berries, but strawberries aren't! 🍌🍓",
                        "A day on Venus is longer than its year! 🪐",
                        "Sharks have been around longer than trees! 🦈",
                        "The human brain uses about 20% of the body's total energy! 🧠",
                        "There are more possible games of chess than atoms in the observable universe! ♟️"
                    ]
                    
                    const randomFact = facts[Math.floor(Math.random() * facts.length)]
                    
                    let factText = `🤓 *AMAZING FACT* 🤓\n\n`
                    factText += `${randomFact}\n\n`
                    factText += `🌟 *God's creation is full of wonders*\n`
                    factText += `📚 *Knowledge is a gift from above*\n\n`
                    factText += `🐞 *Ladybug v6.8 - Learning something new*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: factText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get fact' }, { quoted: m })
                }
                break
            }

            case 'meme': {
                try {
                    const memeTexts = [
                        "When you realize it's Monday tomorrow 😭",
                        "Me trying to adult: *confused screaming* 😵",
                        "When someone says 'we need to talk' 😰",
                        "Me pretending to understand math 🤔",
                        "When you find money in your old clothes 💰",
                        "Me trying to be productive: *lies down* 😴",
                        "When you remember something embarrassing from 10 years ago 🤦",
                        "Me explaining why I need another coffee ☕"
                    ]
                    
                    const randomMeme = memeTexts[Math.floor(Math.random() * memeTexts.length)]
                    
                    let memeText = `😂 *MEME OF THE DAY* 😂\n\n`
                    memeText += `${randomMeme}\n\n`
                    memeText += `🤣 *Hope this made you smile*\n`
                    memeText += `🙏 *Laughter is God's gift*\n\n`
                    memeText += `🐞 *Ladybug v6.8 - Meme generator*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: memeText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get meme' }, { quoted: m })
                }
                break
            }

            // Utility Commands
            case 'weather': {
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a city name!\n\nExample: ${prefix}weather London` }, { quoted: m })
                }
                
                try {
                    // This is a placeholder - you would need a weather API
                    let weatherText = `🌤️ *WEATHER INFORMATION* 🌤️\n\n`
                    weatherText += `✝️ *${botInfo.declaration}*\n\n`
                    weatherText += `📍 *City:* ${text}\n`
                    weatherText += `🌡️ *Temperature:* 25°C\n`
                    weatherText += `☁️ *Condition:* Partly Cloudy\n`
                    weatherText += `💨 *Wind:* 10 km/h\n`
                    weatherText += `💧 *Humidity:* 65%\n\n`
                    weatherText += `🙏 *"He gives rain on the earth"* - Job 5:10\n\n`
                    weatherText += `🐞 *Ladybug v6.8 - Weather service*\n\n`
                    weatherText += `⚠️ *Note: This is a demo. Connect a real weather API for live data.*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: weatherText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get weather info' }, { quoted: m })
                }
                break
            }

            case 'translate': {
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to translate!\n\nExample: ${prefix}translate Hello world` }, { quoted: m })
                }
                
                try {
                    // This is a placeholder - you would need a translation API
                    let translateText = `🌐 *TRANSLATION SERVICE* 🌐\n\n`
                    translateText += `✝️ *${botInfo.declaration}*\n\n`
                    translateText += `📝 *Original:* ${text}\n`
                    translateText += `🔄 *Translated:* [Translation would appear here]\n`
                    translateText += `🗣️ *Language:* Auto-detected\n\n`
                    translateText += `🙏 *"Go and make disciples of all nations"* - Matthew 28:19\n\n`
                    translateText += `🐞 *Ladybug v6.8 - Breaking language barriers*\n\n`
                    translateText += `⚠️ *Note: Connect a translation API for live translations.*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: translateText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to translate text' }, { quoted: m })
                }
                break
            }

            case 'calculator':
            case 'calc': {
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a math expression!\n\nExample: ${prefix}calc 2+2*3` }, { quoted: m })
                }
                
                try {
                    // Simple calculator (be careful with eval in production)
                    const expression = text.replace(/[^0-9+\-*/().\s]/g, '')
                    const result = eval(expression)
                    
                    let calcText = `🧮 *CALCULATOR RESULT* 🧮\n\n`
                    calcText += `✝️ *${botInfo.declaration}*\n\n`
                    calcText += `📊 *Expression:* ${expression}\n`
                    calcText += `🔢 *Result:* ${result}\n\n`
                    calcText += `🙏 *"God is not a God of disorder but of peace"* - 1 Corinthians 14:33\n\n`
                    calcText += `🐞 *Ladybug v6.8 - Mathematical precision*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: calcText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Invalid mathematical expression!' }, { quoted: m })
                }
                break
            }

            case 'qr': {
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text for QR code!\n\nExample: ${prefix}qr Hello World` }, { quoted: m })
                }
                
                try {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
                    
                    let qrText = `📱 *QR CODE GENERATED* 📱\n\n`
                    qrText += `✝️ *${botInfo.declaration}*\n\n`
                    qrText += `📝 *Text:* ${text}\n`
                    qrText += `🔗 *QR Code generated successfully*\n\n`
                    qrText += `🐞 *Ladybug v6.8 - QR Code service*`
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        image: { url: qrUrl },
                        caption: qrText
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to generate QR code' }, { quoted: m })
                }
                break
            }

            // Group Commands
            case 'groupinfo': {
                if (!isGroup) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for groups!' }, { quoted: m })
                }
                
                try {
                    const groupDesc = groupMetadata.desc || 'No description'
                    const groupOwner = groupMetadata.owner || 'Unknown'
                    const creationDate = moment(groupMetadata.creation * 1000).format('DD/MM/YYYY HH:mm:ss')
                    
                    let groupText = `👥 *GROUP INFORMATION* 👥\n\n`
                    groupText += `✝️ *${botInfo.declaration}*\n\n`
                    groupText += `📛 *Name:* ${groupName}\n`
                    groupText += `🆔 *ID:* ${m.chat}\n`
                    groupText += `👑 *Owner:* @${groupOwner.split('@')[0]}\n`
                    groupText += `👥 *Members:* ${participants.length}\n`
                    groupText += `👨‍💼 *Admins:* ${groupAdmins.length}\n`
                    groupText += `📅 *Created:* ${creationDate}\n`
                    groupText += `📝 *Description:* ${groupDesc}\n\n`
                    groupText += `🙏 *"Where two or three gather in my name"* - Matthew 18:20\n\n`
                    groupText += `🐞 *Ladybug v6.8 - Group management*`
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: groupText,
                        mentions: [groupOwner]
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get group info' }, { quoted: m })
                }
                break
            }

            case 'tagall': {
                if (!isGroup) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for groups!' }, { quoted: m })
                }
                
                if (!isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only group admins can use this command!' }, { quoted: m })
                }
                
                try {
                    const message = text || 'Group Announcement'
                    let tagText = `📢 *GROUP ANNOUNCEMENT* 📢\n\n`
                    tagText += `✝️ *${botInfo.declaration}*\n\n`
                    tagText += `📝 *Message:* ${message}\n\n`
                    tagText += `👥 *Tagged Members:*\n`
                    
                    const mentions = []
                    for (const participant of participants) {
                        tagText += `@${participant.id.split('@')[0]} `
                        mentions.push(participant.id)
                    }
                    
                    tagText += `\n\n🙏 *"Let us consider how we may spur one another on"* - Hebrews 10:24\n\n`
                    tagText += `🐞 *Ladybug v6.8 - Group communication*`
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: tagText,
                        mentions: mentions
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to tag all members' }, { quoted: m })
                }
                break
            }

            // Media Commands
            case 'sticker':
            case 's': {
                if (!isMedia) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please reply to an image or video!' }, { quoted: m })
                }
                
                try {
                    const media = await quoted.download()
                    
                    await XeonBotInc.sendImageAsSticker(m.chat, media, m, {
                        packname: `✝️ ${botInfo.name} v${botInfo.version}`,
                        author: `${botInfo.developer}\n${botInfo.declaration}`
                    })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to create sticker' }, { quoted: m })
                }
                break
            }

            // AI Commands (Placeholder)
            case 'ai': {
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a question!\n\nExample: ${prefix}ai What is the meaning of life?` }, { quoted: m })
                }
                
                try {
                    // This is a placeholder - you would need an AI API
                    let aiText = `🤖 *AI ASSISTANT* 🤖\n\n`
                    aiText += `✝️ *${botInfo.declaration}*\n\n`
                    aiText += `❓ *Question:* ${text}\n\n`
                    aiText += `🤖 *AI Response:* I'm a placeholder AI response. To get real AI responses, please connect an AI API like OpenAI, Google Bard, or similar services.\n\n`
                    aiText += `🙏 *"The fear of the Lord is the beginning of wisdom"* - Proverbs 9:10\n\n`
                    aiText += `🐞 *Ladybug v6.8 - AI Integration*\n\n`
                    aiText += `⚠️ *Note: Connect an AI API for real responses.*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: aiText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ AI service unavailable' }, { quoted: m })
                }
                break
            }

            // Default case for unknown commands
            default: {
                if (body.startsWith(prefix)) {
                    let unknownText = `❓ *UNKNOWN COMMAND* ❓\n\n`
                    unknownText += `✝️ *${botInfo.declaration}*\n\n`
                    unknownText += `🤔 Command "${command}" not found!\n\n`
                    unknownText += `💡 *Try these:*\n`
                    unknownText += `• ${prefix}menu - Show all commands\n`
                    unknownText += `• ${prefix}help - Get help\n`
                    unknownText += `• ${prefix}ping - Check bot status\n\n`
                    unknownText += `🙏 *"Ask and it will be given to you"* - Matthew 7:7\n\n`
                    unknownText += `🐞 *Ladybug v6.8 - Here to help*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: unknownText }, { quoted: m })
                }
                break
            }
        }

    } catch (error) {
        console.error(chalk.red('[COMMAND ERROR]'), error)
        
        // Enhanced error handling
        try {
            let errorText = `⚠️ *COMMAND ERROR* ⚠️\n\n`
            errorText += `✝️ *${botInfo.declaration}*\n\n`
            errorText += `❌ *Error:* ${error.message}\n`
            errorText += `🔧 *Command:* ${command}\n`
            errorText += `👤 *User:* ${pushname}\n\n`
            errorText += `🙏 *"Cast all your anxiety on him"* - 1 Peter 5:7\n\n`
            errorText += `🐞 *Ladybug v6.8 - Error handled gracefully*\n\n`
            errorText += `💡 *Try ${prefix}menu for available commands*`
            
            await XeonBotInc.sendMessage(m.chat, { text: errorText }, { quoted: m })
        } catch (sendError) {
            console.error(chalk.red('[SEND ERROR]'), sendError)
        }
    }
}

// Export auto features for external use
module.exports.autoFeatures = autoFeatures
module.exports.saveAutoFeatures = saveAutoFeatures
module.exports.loadAutoFeatures = loadAutoFeatures
module.exports.botInfo = botInfo

// Final blessing log
console.log(chalk.green(`
╭─────────────────────────────────────╮
│  ✝️  LADYBUG BOT v6.8 INITIALIZED  ✝️  │
│                                     │
│  🙏 ${botInfo.declaration}  │
│  📖 ${botInfo.verse.substring(0, 30)}...  │
│  💻 Developer: ${botInfo.developer}     │
│  🐞 Commands: 60+ Available         │
│  🤖 Auto Features: 8 Active         │
│  🌟 Status: Blessed & Ready         │
╰─────────────────────────────────────╯
`))

                    
