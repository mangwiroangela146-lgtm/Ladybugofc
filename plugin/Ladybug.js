/**
 * Ladybug Commands Handler v6.5
 * Enhanced commands for Knight Bot
 * Copyright (c) 2024 MR UNIQUE HACKER
 */

const fs = require('fs')
const chalk = require('chalk')
const axios = require('axios')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const os = require('os')
const moment = require('moment-timezone')

// Load settings and utilities
const settings = require('./settings')
const { getBuffer, fetchJson, runtime, sleep } = require('./lib/myfunc')

// Command prefix
const prefix = settings.prefix || '.'

// Bot info
const botInfo = {
    name: global.botname || 'LADYBUG BOT',
    version: '6.5',
    developer: 'MR UNIQUE HACKER',
    github: 'https://github.com/mrunqiuehacker',
    youtube: 'MR UNIQUE HACKER'
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
        const pushname = m.pushName || "User"
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

        // Only process messages that start with prefix
        if (!body.startsWith(prefix)) return

        console.log(chalk.blue(`[LADYBUG v6.5] Command: ${command} | From: ${pushname} | Chat: ${isGroup ? groupName : 'Private'}`))

        // Enhanced command handlers
        switch (command) {
            case 'ping':
            case 'speed': {
                const timestamp = Date.now()
                const latensi = Date.now() - timestamp
                const neww = performance.now()
                const oldd = performance.now()
                const sysInfo = getSystemInfo()
                
                let responseText = `🏓 *LADYBUG PING v6.5*\n\n`
                responseText += `⚡ *Response Time:* ${latensi}ms\n`
                responseText += `💻 *Process Time:* ${(oldd - neww).toFixed(4)}ms\n`
                responseText += `⏱️ *Bot Runtime:* ${formatRuntime(process.uptime())}\n`
                responseText += `🖥️ *System Uptime:* ${sysInfo.uptime}\n`
                responseText += `💾 *Memory Usage:* ${sysInfo.usedMemory}/${sysInfo.totalMemory}\n`
                responseText += `🔧 *Platform:* ${sysInfo.platform} (${sysInfo.arch})\n`
                responseText += `⚙️ *CPU Cores:* ${sysInfo.cpus}\n`
                responseText += `🟢 *Status:* Online & Optimized ✅`

                await XeonBotInc.sendMessage(m.chat, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'LADYBUG v6.5',
                            serverMessageId: -1
                        },
                        externalAdReply: {
                            title: `🐞 ${botInfo.name} v${botInfo.version}`,
                            body: `System Performance Monitor`,
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
                    const pushname = m.pushName || m.sender.split('@')[0] || 'User'
                    const currentTime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
                    const currentDate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
                    const sysInfo = getSystemInfo()

                    let menuText = `╭─────「 *LADYBUG v6.5* 」─────╮\n`
                    menuText += `│ 🐞 *Bot:* ${botInfo.name}\n`
                    menuText += `│ 👤 *User:* ${pushname}\n`
                    menuText += `│ 📅 *Date:* ${currentDate}\n`
                    menuText += `│ ⏰ *Time:* ${currentTime} IST\n`
                    menuText += `│ ⏱️ *Uptime:* ${formatRuntime(process.uptime())}\n`
                    menuText += `│ 💾 *RAM:* ${sysInfo.usedMemory}/${sysInfo.totalMemory}\n`
                    menuText += `│ 🔧 *Version:* ${botInfo.version}\n`
                    menuText += `╰─────────────────────────────╯\n\n`
                    
                    menuText += `┌─⊷ *GENERAL COMMANDS*\n`
                    menuText += `│• ${prefix}ping - Enhanced system status\n`
                    menuText += `│• ${prefix}menu - Show this menu\n`
                    menuText += `│• ${prefix}runtime - Bot uptime info\n`
                    menuText += `│• ${prefix}owner - Owner information\n`
                    menuText += `│• ${prefix}script - Bot script details\n`
                    menuText += `│• ${prefix}system - System information\n`
                    menuText += `│• ${prefix}status - Bot status check\n`
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
                    
                    menuText += `┌─⊷ *NSFW COMMANDS* 🔞\n`
                    menuText += `│• ${prefix}nsfw <category> - NSFW content\n`
                    menuText += `│ ⚠️ *Admin only in groups*\n`
                    menuText += `│ 📝 Categories: waifu, neko, trap\n`
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
                    
                    menuText += `📊 *Total Commands:* 50+\n`
                    menuText += `🐞 *Powered by Ladybug v6.5*\n`
                    menuText += `💻 *Developer:* ${botInfo.developer}\n`
                    menuText += `🌐 *GitHub:* ${botInfo.github}\n`
                    menuText += `📺 *YouTube:* ${botInfo.youtube}`

                    // Send menu with enhanced context
                    await XeonBotInc.sendMessage(m.chat, {
                        text: menuText,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363161513685998@newsletter',
                                newsletterName: 'Ladybug v6.5 Menu',
                                serverMessageId: -1
                            },
                            externalAdReply: {
                                title: `🐞 ${botInfo.name} v${botInfo.version}`,
                                body: `Complete Command Menu - 50+ Commands`,
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
                    const simpleMenu = `🐞 *LADYBUG BOT v6.5*\n\n` +
                                      `📋 *Available Commands:*\n` +
                                      `• ${prefix}ping - Check speed\n` +
                                      `• ${prefix}menu - Show menu\n` +
                                      `• ${prefix}owner - Owner info\n` +
                                      `• ${prefix}play <song> - Download music\n` +
                                      `• ${prefix}anime <type> - Anime pics\n\n` +
                                      `⚡ Bot is running smoothly!\n` +
                                      `💻 Developer: ${botInfo.developer}`

                    await XeonBotInc.sendMessage(m.chat, { text: simpleMenu }, { quoted: m })
                }
                break
            }

            case 'system':
            case 'sysinfo': {
                const sysInfo = getSystemInfo()
                const processInfo = process.memoryUsage()
                
                let systemText = `🖥️ *SYSTEM INFORMATION*\n\n`
                systemText += `🔧 *Platform:* ${sysInfo.platform}\n`
                systemText += `🏗️ *Architecture:* ${sysInfo.arch}\n`
                systemText += `⚙️ *CPU Cores:* ${sysInfo.cpus}\n`
                systemText += `💾 *Total Memory:* ${sysInfo.totalMemory}\n`
                systemText += `📊 *Used Memory:* ${sysInfo.usedMemory}\n`
                systemText += `🆓 *Free Memory:* ${sysInfo.freeMemory}\n`
                systemText += `⏱️ *System Uptime:* ${sysInfo.uptime}\n`
                systemText += `🤖 *Bot Uptime:* ${formatRuntime(process.uptime())}\n`
                systemText += `📦 *Node.js:* ${sysInfo.nodeVersion}\n`
                systemText += `🔄 *Process RSS:* ${(processInfo.rss / 1024 / 1024).toFixed(2)} MB\n`
                systemText += `📈 *Heap Used:* ${(processInfo.heapUsed / 1024 / 1024).toFixed(2)} MB\n`
                systemText += `📊 *Heap Total:* ${(processInfo.heapTotal / 1024 / 1024).toFixed(2)} MB`

                await XeonBotInc.sendMessage(m.chat, { text: systemText }, { quoted: m })
                break
            }

            case 'status': {
                const sysInfo = getSystemInfo()
                const memoryUsage = process.memoryUsage()
                const cpuUsage = process.cpuUsage()
                
                let statusText = `📊 *BOT STATUS REPORT*\n\n`
                statusText += `🟢 *Status:* Online & Active\n`
                statusText += `⏱️ *Uptime:* ${formatRuntime(process.uptime())}\n`
                statusText += `💾 *Memory:* ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`
                statusText += `🔄 *CPU Usage:* ${((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2)}ms\n`
                statusText += `📱 *Platform:* ${os.platform()}\n`
                statusText += `🔧 *Version:* ${botInfo.version}\n`
                statusText += `📅 *Last Restart:* ${moment().subtract(process.uptime(), 'seconds').format('DD/MM/YYYY HH:mm:ss')}\n`
                statusText += `🌐 *Network:* Connected\n`
                statusText += `⚡ *Performance:* Optimized`

                await XeonBotInc.sendMessage(m.chat, { text: statusText }, { quoted: m })
                break
            }

            case 'ai':
            case 'chatgpt':
            case 'gpt': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a question!\n\nExample: ${prefix}ai What is artificial intelligence?` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🤖 AI is thinking... Please wait.' }, { quoted: m })
                    
                    // You can integrate with OpenAI API or other AI services
                    const aiResponse = `🤖 *AI Assistant Response*\n\n` +
                                     `*Question:* ${text}\n\n` +
                                     `*Answer:* I'm a demo AI response. To get real AI responses, integrate with OpenAI API or other AI services.\n\n` +
                                     `*Note:* This is a placeholder response. Configure your AI API keys for actual functionality.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: aiResponse }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ AI service is currently unavailable' }, { quoted: m })
                }
                break
            }

            case 'imagine':
            case 'aiimage': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide an image prompt!\n\nExample: ${prefix}imagine a beautiful sunset over mountains` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🎨 Generating AI image... Please wait.' }, { quoted: m })
                    
                    // Placeholder for AI image generation
                    const imageCaption = `🎨 *AI Generated Image*\n\n` +
                                       `*Prompt:* ${text}\n\n` +
                                       `*Note:* This is a demo. Integrate with DALL-E, Midjourney, or Stable Diffusion API for actual image generation.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: imageCaption }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ AI image generation failed' }, { quoted: m })
                }
                break
            }

            case 'roast': {
                try {
                    const roasts = [
                        "I'd agree with you, but then we'd both be wrong.",
                        "You're not stupid; you just have bad luck thinking.",
                        "I'm not insulting you, I'm describing you.",
                        "You bring everyone so much joy... when you leave the room.",
                        "I'd explain it to you, but I don't have any crayons with me.",
                        "You're like a cloud. When you disappear, it's a beautiful day.",
                        "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
                        "You're proof that evolution can go in reverse."
                    ]
                    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `🔥 *Roast Generator*\n\n${randomRoast}\n\n*Note:* This is just for fun! 😄` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to generate roast' }, { quoted: m })
                }
                break
            }

            case 'pickup':
            case 'pickupline': {
                try {
                    const pickupLines = [
                        "Are you a magician? Because whenever I look at you, everyone else disappears.",
                        "Do you have a map? I keep getting lost in your eyes.",
                        "Are you a parking ticket? Because you've got 'FINE' written all over you.",
                        "Is your name Google? Because you have everything I've been searching for.",
                        "Are you a camera? Because every time I look at you, I smile.",
                        "Do you believe in love at first sight, or should I walk by again?",
                        "Are you made of copper and tellurium? Because you're Cu-Te.",
                        "If you were a vegetable, you'd be a cute-cumber."
                    ]
                    const randomLine = pickupLines[Math.floor(Math.random() * pickupLines.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `💕 *Pickup Line*\n\n${randomLine}\n\n*Use at your own risk! 😉*` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get pickup line' }, { quoted: m })
                }
                break
            }

            case 'hash':
            case 'md5': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to hash!\n\nExample: ${prefix}hash Hello World` }, { quoted: m })
                
                try {
                    const crypto = require('crypto')
                    const md5 = crypto.createHash('md5').update(text).digest('hex')
                    const sha1 = crypto.createHash('sha1').update(text).digest('hex')
                    const sha256 = crypto.createHash('sha256').update(text).digest('hex')
                    
                    let hashText = `🔐 *Hash Generator*\n\n`
                    hashText += `*Input:* ${text}\n\n`
                    hashText += `*MD5:* \`${md5}\`\n\n`
                    hashText += `*SHA1:* \`${sha1}\`\n\n`
                    hashText += `*SHA256:* \`${sha256}\``
                    
                    await XeonBotInc.sendMessage(m.chat, { text: hashText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to generate hash' }, { quoted: m })
                }
                break
            }

            case 'groupinfo':
            case 'gcinfo': {
                if (!isGroup) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command can only be used in groups!' }, { quoted: m })
                
                try {
                    const metadata = await XeonBotInc.groupMetadata(m.chat)
                    const admins = metadata.participants.filter(v => v.admin !== null).length
                    const members = metadata.participants.length
                    
                    let groupText = `👥 *GROUP INFORMATION*\n\n`
                    groupText += `📝 *Name:* ${metadata.subject}\n`
                    groupText += `🆔 *ID:* ${metadata.id}\n`
                    groupText += `👤 *Members:* ${members}\n`
                    groupText += `👑 *Admins:* ${admins}\n`
                    groupText += `📅 *Created:* ${moment(metadata.creation * 1000).format('DD/MM/YYYY HH:mm:ss')}\n`
                    groupText += `👤 *Owner:* ${metadata.owner ? '@' + metadata.owner.split('@')[0] : 'Unknown'}\n`
                    groupText += `📋 *Description:* ${metadata.desc || 'No description'}`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: groupText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get group information' }, { quoted: m })
                }
                break
            }

            case 'tagall': {
                if (!isGroup) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command can only be used in groups!' }, { quoted: m })
                if (!isGroupAdmins && !isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for group admins!' }, { quoted: m })
                
                try {
                    const metadata = await XeonBotInc.groupMetadata(m.chat)
                    let tagText = `📢 *GROUP ANNOUNCEMENT*\n\n`
                    tagText += `${text || 'Important message for all members!'}\n\n`
                    
                    const mentions = metadata.participants.map(v => v.id)
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: tagText + mentions.map(v => '@' + v.split('@')[0]).join(' '),
                        mentions: mentions
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to tag all members' }, { quoted: m })
                }
                break
            }

            case 'hidetag': {
                if (!isGroup) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command can only be used in groups!' }, { quoted: m })
                if (!isGroupAdmins && !isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for group admins!' }, { quoted: m })
                
                try {
                    const metadata = await XeonBotInc.groupMetadata(m.chat)
                                        const mentions = metadata.participants.map(v => v.id)
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: text || '👻 Hidden tag message',
                        mentions: mentions
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to send hidden tag' }, { quoted: m })
                }
                break
            }

            case 'kick': {
                if (!isGroup) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command can only be used in groups!' }, { quoted: m })
                if (!isGroupAdmins && !isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for group admins!' }, { quoted: m })
                if (!isBotAdmins) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Bot must be admin to kick members!' }, { quoted: m })
                
                try {
                    let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    await XeonBotInc.groupParticipantsUpdate(m.chat, [users], 'remove')
                    await XeonBotInc.sendMessage(m.chat, { text: `✅ Successfully kicked @${users.split('@')[0]}`, mentions: [users] }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to kick member' }, { quoted: m })
                }
                break
            }

            case 'promote': {
                if (!isGroup) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command can only be used in groups!' }, { quoted: m })
                if (!isGroupAdmins && !isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for group admins!' }, { quoted: m })
                if (!isBotAdmins) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Bot must be admin to promote members!' }, { quoted: m })
                
                try {
                    let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    await XeonBotInc.groupParticipantsUpdate(m.chat, [users], 'promote')
                    await XeonBotInc.sendMessage(m.chat, { text: `✅ Successfully promoted @${users.split('@')[0]} to admin`, mentions: [users] }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to promote member' }, { quoted: m })
                }
                break
            }

            case 'demote': {
                if (!isGroup) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command can only be used in groups!' }, { quoted: m })
                if (!isGroupAdmins && !isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for group admins!' }, { quoted: m })
                if (!isBotAdmins) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Bot must be admin to demote members!' }, { quoted: m })
                
                try {
                    let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    await XeonBotInc.groupParticipantsUpdate(m.chat, [users], 'demote')
                    await XeonBotInc.sendMessage(m.chat, { text: `✅ Successfully demoted @${users.split('@')[0]} from admin`, mentions: [users] }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to demote member' }, { quoted: m })
                }
                break
            }

            case 'play':
            case 'song':
            case 'music': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a song name!\n\nExample: ${prefix}play Despacito` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🎵 Searching for your song... Please wait.' }, { quoted: m })
                    
                    // Placeholder for YouTube music download
                    const musicInfo = `🎵 *MUSIC DOWNLOADER*\n\n` +
                                    `*Search:* ${text}\n\n` +
                                    `*Status:* Demo Mode\n` +
                                    `*Note:* Integrate with YouTube API and ytdl-core for actual music download functionality.\n\n` +
                                    `*Features to implement:*\n` +
                                    `• YouTube search\n` +
                                    `• Audio extraction\n` +
                                    `• Quality selection\n` +
                                    `• Metadata embedding`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: musicInfo }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to download music' }, { quoted: m })
                }
                break
            }

            case 'video':
            case 'ytmp4': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a video name!\n\nExample: ${prefix}video Despacito` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '📹 Searching for your video... Please wait.' }, { quoted: m })
                    
                    const videoInfo = `📹 *VIDEO DOWNLOADER*\n\n` +
                                    `*Search:* ${text}\n\n` +
                                    `*Status:* Demo Mode\n` +
                                    `*Note:* Integrate with YouTube API for actual video download.\n\n` +
                                    `*Supported formats:* MP4, 3GP, WEBM\n` +
                                    `*Quality options:* 144p, 240p, 360p, 480p, 720p, 1080p`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: videoInfo }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to download video' }, { quoted: m })
                }
                break
            }

            case 'yts':
            case 'ytsearch': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a search query!\n\nExample: ${prefix}yts Despacito` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🔍 Searching YouTube... Please wait.' }, { quoted: m })
                    
                    const searchResults = `🔍 *YOUTUBE SEARCH RESULTS*\n\n` +
                                        `*Query:* ${text}\n\n` +
                                        `*Demo Results:*\n` +
                                        `1. Sample Video Title 1\n` +
                                        `   Duration: 3:45 | Views: 1M\n\n` +
                                        `2. Sample Video Title 2\n` +
                                        `   Duration: 4:20 | Views: 500K\n\n` +
                                        `*Note:* Integrate with YouTube Data API v3 for real search results.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: searchResults }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ YouTube search failed' }, { quoted: m })
                }
                break
            }

            case 'anime': {
                const animeTypes = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe']
                
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { 
                        text: `🌸 *ANIME IMAGE GENERATOR*\n\n` +
                              `Usage: ${prefix}anime <type>\n\n` +
                              `*Available types:*\n${animeTypes.join(', ')}\n\n` +
                              `*Example:* ${prefix}anime waifu`
                    }, { quoted: m })
                }
                
                if (!animeTypes.includes(text.toLowerCase())) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Invalid anime type! Use: ${animeTypes.join(', ')}` }, { quoted: m })
                }
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🌸 Generating anime image... Please wait.' }, { quoted: m })
                    
                    // Placeholder for anime API integration
                    const animeResponse = `🌸 *ANIME IMAGE*\n\n` +
                                        `*Type:* ${text}\n` +
                                        `*Status:* Demo Mode\n\n` +
                                        `*Note:* Integrate with waifu.pics API or similar anime image APIs for actual functionality.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: animeResponse }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get anime image' }, { quoted: m })
                }
                break
            }

            case 'nsfw': {
                if (isGroup && !isGroupAdmins && !isOwner) {
                    return await XeonBotInc.sendMessage(m.chat, { text: '❌ NSFW commands are restricted to admins in groups!' }, { quoted: m })
                }
                
                const nsfwTypes = ['waifu', 'neko', 'trap', 'blowjob']
                
                if (!text) {
                    return await XeonBotInc.sendMessage(m.chat, { 
                        text: `🔞 *NSFW CONTENT*\n\n` +
                              `Usage: ${prefix}nsfw <type>\n\n` +
                              `*Available types:*\n${nsfwTypes.join(', ')}\n\n` +
                              `⚠️ *Warning:* 18+ content only!`
                    }, { quoted: m })
                }
                
                if (!nsfwTypes.includes(text.toLowerCase())) {
                    return await XeonBotInc.sendMessage(m.chat, { text: `❌ Invalid NSFW type! Use: ${nsfwTypes.join(', ')}` }, { quoted: m })
                }
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🔞 Generating NSFW content... Please wait.' }, { quoted: m })
                    
                    const nsfwResponse = `🔞 *NSFW CONTENT*\n\n` +
                                       `*Type:* ${text}\n` +
                                       `*Status:* Demo Mode\n\n` +
                                       `*Note:* Integrate with appropriate NSFW APIs for actual functionality.\n` +
                                       `*Warning:* Ensure compliance with platform policies!`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: nsfwResponse }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get NSFW content' }, { quoted: m })
                }
                break
            }

            case 'sticker':
            case 'stiker':
            case 's': {
                if (!quoted) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Reply to an image or video to create sticker!' }, { quoted: m })
                if (!/image|video/.test(mime)) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only images and videos are supported!' }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🎨 Creating sticker... Please wait.' }, { quoted: m })
                    
                    let media = await quoted.download()
                    let webpSticker = await XeonBotInc.sendImageAsSticker(m.chat, media, m, { 
                        packname: global.packname || 'Ladybug v6.5', 
                        author: global.author || 'MR UNIQUE HACKER' 
                    })
                    
                    await fs.unlinkSync(webpSticker)
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to create sticker' }, { quoted: m })
                }
                break
            }

            case 'toimg':
            case 'toimage': {
                if (!quoted) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Reply to a sticker to convert to image!' }, { quoted: m })
                if (!/webp/.test(mime)) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only stickers are supported!' }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🖼️ Converting sticker to image... Please wait.' }, { quoted: m })
                    
                    let media = await quoted.download()
                    await XeonBotInc.sendMessage(m.chat, { image: media }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to convert sticker' }, { quoted: m })
                }
                break
            }

            case 'weather': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a city name!\n\nExample: ${prefix}weather London` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🌤️ Getting weather information... Please wait.' }, { quoted: m })
                    
                    const weatherInfo = `🌤️ *WEATHER INFORMATION*\n\n` +
                                      `*City:* ${text}\n` +
                                      `*Temperature:* 25°C\n` +
                                      `*Condition:* Sunny\n` +
                                      `*Humidity:* 60%\n` +
                                      `*Wind Speed:* 10 km/h\n\n` +
                                      `*Note:* This is demo data. Integrate with OpenWeatherMap API for real weather data.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: weatherInfo }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get weather information' }, { quoted: m })
                }
                break
            }

            case 'translate':
            case 'tr': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to translate!\n\nExample: ${prefix}translate Hello World` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🌐 Translating text... Please wait.' }, { quoted: m })
                    
                    const translateInfo = `🌐 *TRANSLATION SERVICE*\n\n` +
                                        `*Original:* ${text}\n` +
                                        `*Translated:* [Demo Translation]\n` +
                                        `*Language:* Auto-detected\n\n` +
                                        `*Note:* Integrate with Google Translate API for actual translation functionality.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: translateInfo }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Translation failed' }, { quoted: m })
                }
                break
            }

            case 'qr':
            case 'qrcode': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text for QR code!\n\nExample: ${prefix}qr Hello World` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '📱 Generating QR code... Please wait.' }, { quoted: m })
                    
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`
                    const qrBuffer = await getBuffer(qrUrl)
                    
                    await XeonBotInc.sendMessage(m.chat, { 
                        image: qrBuffer, 
                        caption: `📱 *QR CODE GENERATED*\n\n*Text:* ${text}\n\n*Scan this QR code with your device!*` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to generate QR code' }, { quoted: m })
                }
                break
            }

            case 'joke': {
                try {
                    const jokes = [
                        "Why don't scientists trust atoms? Because they make up everything!",
                        "Why did the scarecrow win an award? He was outstanding in his field!",
                        "Why don't eggs tell jokes? They'd crack each other up!",
                        "What do you call a fake noodle? An impasta!",
                        "Why did the math book look so sad? Because it had too many problems!",
                        "What do you call a bear with no teeth? A gummy bear!",
                        "Why can't a bicycle stand up by itself? It's two tired!",
                        "What do you call a fish wearing a bowtie? Sofishticated!"
                    ]
                    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `😂 *RANDOM JOKE*\n\n${randomJoke}\n\n*Hope that made you smile! 😄*` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get joke' }, { quoted: m })
                }
                break
            }

            case 'quote': {
                try {
                    const quotes = [
                        "The only way to do great work is to love what you do. - Steve Jobs",
                        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                        "Life is what happens to you while you're busy making other plans. - John Lennon",
                        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                        "It is during our darkest moments that we must focus to see the light. - Aristotle",
                        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
                        "The only impossible journey is the one you never begin. - Tony Robbins",
                        "In the middle of difficulty lies opportunity. - Albert Einstein"
                    ]
                    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `💭 *INSPIRATIONAL QUOTE*\n\n${randomQuote}\n\n*Stay motivated! 🌟*` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get quote' }, { quoted: m })
                }
                break
            }

            case 'fact': {
                try {
                    const facts = [
                        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
                        "A group of flamingos is called a 'flamboyance'.",
                        "Bananas are berries, but strawberries aren't.",
                        "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
                        "A single cloud can weight more than 1 million pounds.",
                        "Octopuses have three hearts and blue blood.",
                        "The human brain uses about 20% of the body's total energy.",
                        "There are more possible games of chess than there are atoms in the observable universe."
                    ]
                    const randomFact = facts[Math.floor(Math.random() * facts.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `🧠 *RANDOM FACT*\n\n${randomFact}\n\n*Knowledge is power! 📚*` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get fact' }, { quoted: m })
                }
                break
            }

            case 'meme': {
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '😂 Getting a random meme... Please wait.' }, { quoted: m })
                    
                    // Placeholder for meme API
                    const memeText = `😂 *RANDOM MEME*\n\n` +
                                   `*Status:* Demo Mode\n\n` +
                                   `*Note:* Integrate with meme APIs like:\n` +
                                   `• Reddit API (r/memes)\n` +
                                   `• Imgflip API\n` +
                                   `• Meme Generator APIs\n\n` +
                                   `*For actual meme functionality!*`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: memeText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get meme' }, { quoted: m })
                }
                break
            }

            case 'truth': {
                try {
                    const truths = [
                        "What's the most embarrassing thing you've ever done?",
                        "Have you ever lied to your best friend?",
                        "What's your biggest fear?",
                        "What's the weirdest dream you've ever had?",
                        "Have you ever had a crush on a teacher?",
                        "What's your most embarrassing childhood memory?",
                        "Have you ever cheated on a test?",
                        "What's the longest you've gone without showering?"
                    ]
                    const randomTruth = truths[Math.floor(Math.random() * truths.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `🤔 *TRUTH QUESTION*\n\n${randomTruth}\n\n*Answer honestly! 😊*` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get truth question' }, { quoted: m })
                }
                break
            }

            case 'dare': {
                try {
                    const dares = [
                        "Do 20 push-ups right now!",
                        "Send a voice message singing your favorite song!",
                        "Change your profile picture to something funny for 1 hour!",
                        "Text your crush and tell them a joke!",
                        "Do a silly dance and record it!",
                        "Eat a spoonful of a condiment of your choice!",
                        "Call a random contact and sing 'Happy Birthday' to them!",
                        "Post an embarrassing photo of yourself!"
                    ]
                    const randomDare = dares[Math.floor(Math.random() * dares.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `😈 *DARE CHALLENGE*\n\n${randomDare}\n\n*Are you brave enough? 💪*` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get dare challenge' }, { quoted: m })
                }
                break
            }

            case 'calculator':
            case 'calc': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a math expression!\n\nExample: ${prefix}calc 2 + 2` }, { quoted: m })
                
                try {
                    // Simple calculator using eval (be careful with eval in production)
                    const expression = text.replace(/[^0-9+\-*/().\s]/g, '')
                    if (!expression) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Invalid mathematical expression!' }, { quoted: m })
                    
                    const result = eval(expression)
                    
                    let calcText = `🧮 *CALCULATOR*\n\n`
                    calcText += `*Expression:* ${expression}\n`
                    calcText += `*Result:* ${result}\n\n`
                    calcText += `*Note:* Basic arithmetic operations supported`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: calcText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Invalid mathematical expression!' }, { quoted: m })
                }
                break
            }

            case 'base64': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to encode/decode!\n\nExample: ${prefix}base64 Hello World` }, { quoted: m })
                
                try {
                    let result
                    let operation
                    
                    // Check if it's base64 encoded (try to decode)
                    try {
                        const decoded = Buffer.from(text, 'base64').toString('utf-8')
                        if (Buffer.from(decoded, 'utf-8').toString('base64') === text) {
                            result = decoded
                            operation = 'Decoded'
                        } else {
                            throw new Error('Not base64')
                        }
                    } catch {
                        // If not base64, encode it
                        result = Buffer.from(text, 'utf-8').toString('base64')
                        operation = 'Encoded'
                    }
                    
                    let base64Text = `🔐 *BASE64 CONVERTER*\n\n`
                    base64Text += `*Operation:* ${operation}\n`
                    base64Text += `*Input:* ${text}\n`
                    base64Text += `*Output:* ${result}`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: base64Text }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to process base64' }, { quoted: m })
                }
                break
            }

            case 'password':
            case 'genpass': {
                try {
                    const length = parseInt(text) || 12
                    if (length < 4 || length > 50) {
                        return await XeonBotInc.sendMessage(m.chat, { text: '❌ Password length must be between 4 and 50 characters!' }, { quoted: m })
                    }
                    
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
                    let password = ''
                    
                    for (let i = 0; i < length; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length))
                    }
                    
                    let passText = `🔐 *PASSWORD GENERATOR*\n\n`
                    passText += `*Length:* ${length} characters\n`
                    passText += `*Generated Password:* \`${password}\`\n\n`
                    passText += `*Security Tips:*\n`
                    passText += `• Don't share your password\n`
                    passText += `• Use unique passwords for each account\n`
                    passText += `• Enable 2FA when possible`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: passText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to generate password' }, { quoted: m })
                }
                break
            }

            case 'shorturl':
            case 'tinyurl': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a URL to shorten!\n\nExample: ${prefix}shorturl https://google.com` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🔗 Shortening URL... Please wait.' }, { quoted: m })
                    
                    // Placeholder for URL shortening service
                    const shortUrlText = `🔗 *URL SHORTENER*\n\n` +
                                       `*Original URL:* ${text}\n` +
                                       `*Shortened URL:* [Demo - Integrate with TinyURL/Bitly API]\n\n` +
                                       `*Note                  await XeonBotInc.sendMessage(m.chat, { text: shortUrlText }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to shorten URL' }, { quoted: m })
            }
            break
        }

        case 'removebg':
        case 'nobg': {
            if (!quoted) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Reply to an image to remove background!' }, { quoted: m })
            if (!/image/.test(mime)) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only images are supported!' }, { quoted: m })
            
            try {
                await XeonBotInc.sendMessage(m.chat, { text: '🎨 Removing background... Please wait.' }, { quoted: m })
                
                const removeBgText = `🎨 *BACKGROUND REMOVER*\n\n` +
                                   `*Status:* Demo Mode\n\n` +
                                   `*Note:* Integrate with Remove.bg API or similar background removal services for actual functionality.\n\n` +
                                   `*Required:* API key from remove.bg`
                
                await XeonBotInc.sendMessage(m.chat, { text: removeBgText }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to remove background' }, { quoted: m })
            }
            break
        }

        case 'tovideo':
        case 'togif': {
            if (!quoted) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Reply to an image to convert to video!' }, { quoted: m })
            if (!/image/.test(mime)) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only images are supported!' }, { quoted: m })
            
            try {
                await XeonBotInc.sendMessage(m.chat, { text: '🎬 Converting image to video... Please wait.' }, { quoted: m })
                
                let media = await quoted.download()
                // This would require ffmpeg integration for actual conversion
                await XeonBotInc.sendMessage(m.chat, { text: '🎬 Image to video conversion requires ffmpeg integration.' }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to convert image' }, { quoted: m })
            }
            break
        }

        case 'toaudio':
        case 'tomp3': {
            if (!quoted) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Reply to a video to extract audio!' }, { quoted: m })
            if (!/video/.test(mime)) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only videos are supported!' }, { quoted: m })
            
            try {
                await XeonBotInc.sendMessage(m.chat, { text: '🎵 Extracting audio... Please wait.' }, { quoted: m })
                
                let media = await quoted.download()
                // This would require ffmpeg integration for actual conversion
                await XeonBotInc.sendMessage(m.chat, { text: '🎵 Video to audio conversion requires ffmpeg integration.' }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to extract audio' }, { quoted: m })
            }
            break
        }

        case 'runtime':
        case 'uptime': {
            const uptimeText = `⏱️ *BOT RUNTIME*\n\n` +
                             `*Current Uptime:* ${formatRuntime(process.uptime())}\n` +
                             `*Started:* ${moment().subtract(process.uptime(), 'seconds').format('DD/MM/YYYY HH:mm:ss')}\n` +
                             `*System Uptime:* ${formatRuntime(os.uptime())}\n` +
                             `*Memory Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                             `*Platform:* ${os.platform()}\n` +
                             `*Node Version:* ${process.version}`

            await XeonBotInc.sendMessage(m.chat, { text: uptimeText }, { quoted: m })
            break
        }

        case 'owner':
        case 'creator': {
            const ownerText = `👤 *BOT OWNER INFORMATION*\n\n` +
                            `*Name:* ${botInfo.developer}\n` +
                            `*Bot:* $${botInfo.name} v$$ {botInfo.version}\n` +
                            `*GitHub:* ${botInfo.github}\n` +
                            `*YouTube:* ${botInfo.youtube}\n\n` +
                            `*Contact:* For support and updates\n` +
                            `*Status:* Active Developer\n\n` +
                            `🐞 *Powered by Ladybug Framework*`

            await XeonBotInc.sendMessage(m.chat, {
                text: ownerText,
                contextInfo: {
                    externalAdReply: {
                        title: `👤 ${botInfo.developer}`,
                        body: `Bot Developer & Creator`,
                        thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                        sourceUrl: botInfo.github,
                        mediaType: 1
                    }
                }
            }, { quoted: m })
            break
        }

        case 'script':
        case 'sc': {
            const scriptText = `📜 *BOT SCRIPT INFORMATION*\n\n` +
                             `*Name:* ${botInfo.name}\n` +
                             `*Version:* ${botInfo.version}\n` +
                             `*Framework:* Ladybug Commands Handler\n` +
                             `*Developer:* ${botInfo.developer}\n` +
                             `*Language:* JavaScript (Node.js)\n` +
                             `*Library:* @whiskeysockets/baileys\n\n` +
                             `*Features:*\n` +
                             `• 50+ Commands\n` +
                             `• Multi-platform support\n` +
                             `• Advanced error handling\n` +
                             `• Modular architecture\n` +
                             `• Real-time updates\n\n` +
                             `*GitHub:* ${botInfo.github}\n` +
                             `*YouTube:* ${botInfo.youtube}\n\n` +
                             `🐞 *Open Source & Free to Use*`

            await XeonBotInc.sendMessage(m.chat, {
                text: scriptText,
                contextInfo: {
                    externalAdReply: {
                        title: `📜 ${botInfo.name} Script`,
                        body: `Open Source WhatsApp Bot`,
                        thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                        sourceUrl: botInfo.github,
                        mediaType: 1
                    }
                }
            }, { quoted: m })
            break
        }

        // Owner-only commands
        case 'restart': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            
            await XeonBotInc.sendMessage(m.chat, { text: '🔄 Restarting bot... Please wait.' }, { quoted: m })
            process.exit()
            break
        }

        case 'eval': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            if (!text) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide code to evaluate!' }, { quoted: m })
            
            try {
                let evaled = await eval(text)
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                await XeonBotInc.sendMessage(m.chat, { text: `*Eval Result:*\n\`\`\`${evaled}\`\`\`` }, { quoted: m })
            } catch (err) {
                await XeonBotInc.sendMessage(m.chat, { text: `*Eval Error:*\n\`\`\`${err}\`\`\`` }, { quoted: m })
            }
            break
        }

        case 'exec': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            if (!text) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide command to execute!' }, { quoted: m })
            
            try {
                const { stdout, stderr } = await execAsync(text)
                let result = stdout || stderr || 'Command executed successfully'
                await XeonBotInc.sendMessage(m.chat, { text: `*Exec Result:*\n\`\`\`${result}\`\`\`` }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: `*Exec Error:*\n\`\`\`${error.message}\`\`\`` }, { quoted: m })
            }
            break
        }

        case 'block': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            
            try {
                let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await XeonBotInc.updateBlockStatus(users, 'block')
                await XeonBotInc.sendMessage(m.chat, { text: `✅ Successfully blocked @${users.split('@')[0]}`, mentions: [users] }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to block user' }, { quoted: m })
            }
            break
        }

        case 'unblock': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            
            try {
                let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await XeonBotInc.updateBlockStatus(users, 'unblock')
                await XeonBotInc.sendMessage(m.chat, { text: `✅ Successfully unblocked @${users.split('@')[0]}`, mentions: [users] }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to unblock user' }, { quoted: m })
            }
            break
        }

        case 'setpp':
        case 'setbotpp': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            if (!quoted) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Reply to an image to set as bot profile picture!' }, { quoted: m })
            if (!/image/.test(mime)) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Only images are supported!' }, { quoted: m })
            
            try {
                let media = await quoted.download()
                await XeonBotInc.updateProfilePicture(botNumber, media)
                await XeonBotInc.sendMessage(m.chat, { text: '✅ Bot profile picture updated successfully!' }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to update profile picture' }, { quoted: m })
            }
            break
        }

        case 'setname':
        case 'setbotname': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            if (!text) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide a new name for the bot!' }, { quoted: m })
            
            try {
                await XeonBotInc.updateProfileName(text)
                await XeonBotInc.sendMessage(m.chat, { text: `✅ Bot name updated to: ${text}` }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to update bot name' }, { quoted: m })
            }
            break
        }

        case 'broadcast':
        case 'bc': {
            if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the bot owner!' }, { quoted: m })
            if (!text) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide broadcast message!' }, { quoted: m })
            
            try {
                const broadcastText = `📢 *BROADCAST MESSAGE*\n\n${text}\n\n*From:* $${botInfo.name} v$$ {botInfo.version}`
                
                // This would require storing chat IDs to broadcast to all chats
                await XeonBotInc.sendMessage(m.chat, { text: '📢 Broadcast feature requires chat storage implementation.' }, { quoted: m })
            } catch (error) {
                await XeonBotInc.sendMessage(m.chat, { text: '❌ Broadcast failed' }, { quoted: m })
            }
            break
        }

        // Default case for unknown commands
        default: {
            // Only respond if it's a clear command attempt (starts with prefix)
            if (body.startsWith(prefix)) {
                const unknownCmd = `❌ *Unknown Command*\n\n` +
                                 `Command "${command}" not found!\n\n` +
                                 `Type ${prefix}menu to see all available commands.\n\n` +
                                 `🐞 *Ladybug v${botInfo.version}*`
                
                await XeonBotInc.sendMessage(m.chat, { text: unknownCmd }, { quoted: m })
            }
            break
        }
    }

} catch (err) {
    console.error(chalk.red('[ERROR]'), err)
    
    // Enhanced error reporting
    const errorText = `⚠️ *SYSTEM ERROR*\n\n` +
                     `*Command:* ${command || 'Unknown'}\n` +
                     `*Error:* ${err.message || 'Unknown error'}\n` +
                     `*Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}\n\n` +
                     `*Please report this error to the developer.*\n` +
                     `*GitHub:* ${botInfo.github}`

    try {
        await XeonBotInc.sendMessage(m.chat, { text: errorText }, { quoted: m })
    } catch (sendError) {
        console.error(chalk.red('[SEND ERROR]'), sendError)
    }
}


                    
