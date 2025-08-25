/**
 * Ladybug Commands Handler
 * Additional commands for Knight Bot
 * Copyright (c) 2024 Professor
 */

const fs = require('fs')
const chalk = require('chalk')
const axios = require('axios')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

// Load settings and utilities
const settings = require('./settings')
const { getBuffer, fetchJson, runtime, sleep } = require('./lib/myfunc')

// Command prefix
const prefix = settings.prefix || '.'

module.exports = async (XeonBotInc, m, chatUpdate, store) => {
    try {
        // Basic message info
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
        const pushname = m.pushName || "No Name"
        const botNumber = await XeonBotInc.decodeJid(XeonBotInc.user.id)
        const isOwner = [botNumber, ...settings.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const text = args.join(" ")
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        const isMedia = /image|video|sticker|audio/.test(mime)

        // Only process messages that start with prefix
        if (!body.startsWith(prefix)) return

        console.log(chalk.blue(`[LADYBUG] Command: ${command} | From: ${pushname} | Chat: ${m.chat}`))

        // Command handlers
        switch (command) {
            case 'ping':
            case 'speed': {
                const timestamp = Date.now()
                const latensi = Date.now() - timestamp
                const neww = performance.now()
                const oldd = performance.now()
                
                let responseText = `🏓 *Pong!*\n\n`
                responseText += `⚡ *Response Time:* ${latensi}ms\n`
                responseText += `💻 *Process Time:* ${(oldd - neww).toFixed(4)}ms\n`
                responseText += `⏱️ *Runtime:* ${runtime(process.uptime())}\n`
                responseText += `🤖 *Bot Status:* Online ✅`

                await XeonBotInc.sendMessage(m.chat, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '61513685998@newsletter',
                            newsletterName: 'LADYBUG BOT',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: m })
                break
            }

                        case 'menu':
            case 'help': {
                let menuText = `╭─────「 *LADYBUG MENU* 」─────╮\n`
                menuText += `│ 🤖 *Bot:* ${global.botname}\n`
                menuText += `│ 👤 *User:* ${pushname}\n`
                menuText += `│ 📅 *Date:* ${new Date().toLocaleDateString()}\n`
                menuText += `│ ⏰ *Time:* ${new Date().toLocaleTimeString()}\n`
                menuText += `│ ⏱️ *Uptime:* ${runtime(process.uptime())}\n`
                menuText += `╰─────────────────────────────╯\n\n`
                
                menuText += `┌─⊷ *GENERAL COMMANDS*\n`
                menuText += `│• ${prefix}ping - Check bot speed\n`
                menuText += `│• ${prefix}menu - Show this menu\n`
                menuText += `│• ${prefix}runtime - Bot uptime\n`
                menuText += `│• ${prefix}owner - Owner info\n`
                menuText += `│• ${prefix}script - Bot script info\n`
                menuText += `└────────────⊷\n\n`
                
                menuText += `┌─⊷ *YOUTUBE COMMANDS*\n`
                menuText += `│• ${prefix}yts <query> - YouTube search\n`
                menuText += `│• ${prefix}play <song> - Download audio\n`
                menuText += `│• ${prefix}song <title> - Download music\n`
                menuText += `│• ${prefix}video <title> - Download video\n`
                menuText += `│• ${prefix}ytmp4 <title> - Download MP4\n`
                menuText += `└────────────⊷\n\n`
                
                menuText += `┌─⊷ *ANIME COMMANDS*\n`
                menuText += `│• ${prefix}anime <category> - Anime images\n`
                menuText += `│• ${prefix}waifu - Random waifu\n`
                menuText += `│• ${prefix}neko - Random neko\n`
                menuText += `│• ${prefix}animepic <type> - Anime pics\n`
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
                menuText += `└────────────⊷\n\n`
                
                menuText += `┌─⊷ *UTILITY COMMANDS*\n`
                menuText += `│• ${prefix}weather <city> - Weather info\n`
                menuText += `│• ${prefix}translate <text> - Translate text\n`
                menuText += `│• ${prefix}qr <text> - Generate QR code\n`
                menuText += `│• ${prefix}shorturl <url> - Shorten URL\n`
                menuText += `│• ${prefix}calculator <math> - Calculate\n`
                menuText += `│• ${prefix}base64 <text> - Encode/decode\n`
                menuText += `└────────────⊷\n\n`
                
                menuText += `┌─⊷ *OWNER COMMANDS*\n`
                menuText += `│• ${prefix}restart - Restart bot\n`
                menuText += `│• ${prefix}eval - Execute code\n`
                menuText += `│• ${prefix}exec - Execute terminal\n`
                menuText += `│• ${prefix}broadcast - Send to all\n`
                menuText += `│• ${prefix}block - Block user\n`
                menuText += `│• ${prefix}unblock - Unblock user\n`
                menuText += `└────────────⊷\n\n`
                
                menuText += `📊 *Total Commands:* 35+\n`
                menuText += `🐞 *Powered by Ladybug v2.0*\n`
                menuText += `💻 *Developer:* MR UNIQUE HACKER`

                // Audio URL for menu sound
                const menuAudioUrl = "https://github.com/DGXeon/Tiktokmusic-API/raw/master/tiktokmusic/sound2.mp3"

                await XeonBotInc.sendMessage(m.chat, {
                    audio: { url: menuAudioUrl },
                    mimetype: 'audio/mp4',
                    ptt: true,
                    contextInfo: {
                        externalAdReply: {
                            title: `🐞 ${global.botname} Menu`,
                            body: `Hello ${pushname}! Here's the complete menu`,
                            thumbnailUrl: 'https://i.imgur.com/your-bot-image.jpg', // Replace with your bot image
                            sourceUrl: 'https://github.com/mrunqiuehacker',
                            mediaType: 2,
                            mediaUrl: 'https://github.com/mrunqiuehacker'
                        }
                    }
                }, { quoted: m })

                // Send menu text after audio
                await XeonBotInc.sendMessage(m.chat, {
                    text: menuText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'Ladybug MD',
                            serverMessageId: -1
                        },
                        externalAdReply: {
                            title: `🐞 ${global.botname} Commands`,
                            body: `Total: 35+ Commands Available`,
                            thumbnailUrl: 'https://i.imgur.com/your-menu-image.jpg', // Replace with menu image
                            sourceUrl: 'https://github.com/mrunqiuehacker',
                            mediaType: 1,
                            mediaUrl: 'https://github.com/mrunqiuehacker'
                        }
                    }
                }, { quoted: m })
                break
            }

            // Alternative menu with image
            case 'allmenu':
            case 'fullmenu': {
                let fullMenuText = `╔══════════════════════╗\n`
                fullMenuText += `║    🐞 LADYBUG BOT 🐞    ║\n`
                fullMenuText += `╚══════════════════════╝\n\n`
                
                fullMenuText += `👋 *Hello ${pushname}!*\n`
                fullMenuText += `🤖 *Bot Name:* ${global.botname}\n`
                fullMenuText += `📅 *Date:* ${new Date().toLocaleDateString()}\n`
                fullMenuText += `⏰ *Time:* ${new Date().toLocaleTimeString()}\n`
                fullMenuText += `⏱️ *Runtime:* ${runtime(process.uptime())}\n\n`
                
                fullMenuText += `╭─「 🎵 YOUTUBE DOWNLOADER 」\n`
                fullMenuText += `│ ${prefix}yts <query>\n`
                fullMenuText += `│ ${prefix}play <song>\n`
                fullMenuText += `│ ${prefix}song <title>\n`
                fullMenuText += `│ ${prefix}video <title>\n`
                fullMenuText += `│ ${prefix}ytmp4 <title>\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `╭─「 🎌 ANIME & IMAGES 」\n`
                fullMenuText += `│ ${prefix}anime waifu\n`
                fullMenuText += `│ ${prefix}anime neko\n`
                fullMenuText += `│ ${prefix}anime maid\n`
                fullMenuText += `│ ${prefix}waifu\n`
                fullMenuText += `│ ${prefix}neko\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `╭─「 🔞 NSFW (Admin Only) 」\n`
                fullMenuText += `│ ${prefix}nsfw waifu\n`
                fullMenuText += `│ ${prefix}nsfw neko\n`
                fullMenuText += `│ ${prefix}nsfw trap\n`
                fullMenuText += `│ ${prefix}nsfw blowjob\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `╭─「 🎮 FUN & GAMES 」\n`
                fullMenuText += `│ ${prefix}joke\n`
                fullMenuText += `│ ${prefix}quote\n`
                fullMenuText += `│ ${prefix}fact\n`
                fullMenuText += `│ ${prefix}meme\n`
                fullMenuText += `│ ${prefix}truth\n`
                fullMenuText += `│ ${prefix}dare\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `╭─「 🛠️ UTILITIES 」\n`
                fullMenuText += `│ ${prefix}weather <city>\n`
                fullMenuText += `│ ${prefix}translate <text>\n`
                fullMenuText += `│ ${prefix}qr <text>\n`
                fullMenuText += `│ ${prefix}shorturl <url>\n`
                fullMenuText += `│ ${prefix}calculator <math>\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `╭─「 ⚙️ GENERAL 」\n`
                fullMenuText += `│ ${prefix}ping\n`
                fullMenuText += `│ ${prefix}runtime\n`
                fullMenuText += `│ ${prefix}owner\n`
                fullMenuText += `│ ${prefix}script\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `╭─「 👑 OWNER ONLY 」\n`
                fullMenuText += `│ ${prefix}restart\n`
                fullMenuText += `│ ${prefix}eval <code>\n`
                fullMenuText += `│ ${prefix}exec <cmd>\n`
                fullMenuText += `│ ${prefix}broadcast <text>\n`
                fullMenuText += `╰────────────────────\n\n`
                
                fullMenuText += `┌─────────────────────┐\n`
                fullMenuText += `│ 💻 Developer: MR NTANDO OFC\n`
                fullMenuText += `│ 🌐 GitHub: mrnta-source\n`
                fullMenuText += `│ 📺 YouTube: MR NTANDO OFC\n`
                fullMenuText += `│ 🐞 Version: Ladybug 5.0\n`
                fullMenuText += `└─────────────────────┘`

                await XeonBotInc.sendMessage(m.chat, {
                    image: { url: 'https://i.imgur.com/your-full-menu-image.jpg' }, // Replace with your image
                    caption: fullMenuText,
                    contextInfo: {
                        externalAdReply: {
                            title: `🐞 ${global.botname} Full Menu`,
                            body: `Complete command list for ${pushname}`,
                            thumbnailUrl: 'https://i.imgur.com/your-thumbnail.jpg',
                            sourceUrl: 'https://github.com/mrnta-source',
                            mediaType: 1,
                            mediaUrl: 'https://github.com/mrnta-source'
                        }
                    }
                }, { quoted: m })
                break
            }

            // Simple menu without audio
            case 'list':
            case 'commands': {
                const commandList = `🐞 *LADYBUG COMMANDS*\n\n` +
                `🎵 *YouTube:* yts, play, video\n` +
                `🎌 *Anime:* anime, waifu, neko\n` +
                `🔞 *NSFW:* nsfw (admin only)\n` +
                `🎮 *Fun:* joke, quote, meme\n` +
                `🛠️ *Utility:* weather, qr, translate\n` +
                `⚙️ *General:* ping, runtime, owner\n` +
                `👑 *Owner:* restart, eval, exec\n\n` +
                `📝 Type ${prefix}menu for detailed list`

                await XeonBotInc.sendMessage(m.chat, { text: commandList }, { quoted: m })
                break
            }


            case 'runtime':
            case 'uptime': {
                const uptimeText = `⏱️ *Bot Runtime*\n\n${runtime(process.uptime())}`
                await XeonBotInc.sendMessage(m.chat, { text: uptimeText }, { quoted: m })
                break
            }

            case 'owner': {
                const ownerText = `👤 *Bot Owner Information*\n\n`
                + `📱 *Number:* ${settings.owner}\n`
                + `🤖 *Bot:* ${global.botname}\n`
                + `💻 *Developer:* MR UNIQUE HACKER\n`
                + `🌐 *GitHub:* mrunqiuehacker\n`
                + `📺 *YouTube:* MR UNIQUE HACKER`

                await XeonBotInc.sendMessage(m.chat, { text: ownerText }, { quoted: m })
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
                        "Why don't skeletons fight each other? They don't have the guts!",
                        "What's orange and sounds like a parrot? A carrot!"
                    ]
                    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `😂 *Random Joke*\n\n${randomJoke}` }, { quoted: m })
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
                        "The only impossible journey is the one you never begin. - Tony Robbins"
                    ]
                    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `💭 *Inspirational Quote*\n\n${randomQuote}` }, { quoted: m })
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
                        "The human brain uses about 20% of the body's total energy.",
                        "Octopuses have three hearts and blue blood."
                    ]
                    const randomFact = facts[Math.floor(Math.random() * facts.length)]
                    await XeonBotInc.sendMessage(m.chat, { text: `🧠 *Random Fact*\n\n${randomFact}` }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get fact' }, { quoted: m })
                }
                break
            }

            case 'weather': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a city name!\n\nExample: ${prefix}weather London` }, { quoted: m })
                
                try {
                    // You can replace this with a real weather API
                    const weatherText = `🌤️ *Weather Information*\n\n`
                    + `📍 *Location:* ${text}\n`
                    + `🌡️ *Temperature:* 25°C\n`
                    + `☁️ *Condition:* Partly Cloudy\n`
                    + `💨 *Wind:* 10 km/h\n`
                    + `💧 *Humidity:* 65%\n\n`
                    + `*Note:* This is a demo response. Connect to a real weather API for actual data.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: weatherText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get weather information' }, { quoted: m })
                }
                break
            }

            case 'qr': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to generate QR code!\n\nExample: ${prefix}qr Hello World` }, { quoted: m })
                
                try {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
                    const buffer = await getBuffer(qrUrl)
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        image: buffer,
                        caption: `📱 *QR Code Generated*\n\n*Text:* ${text}`
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to generate QR code' }, { quoted: m })
                }
                break
            }

            case 'translate': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to translate!\n\nExample: ${prefix}translate Hello` }, { quoted: m })
                
                try {
                    // This is a demo response. You can integrate with Google Translate API
                    const translateText = `🌐 *Translation*\n\n`
                    + `*Original:* ${text}\n`
                    + `*Translated:* Hola (Spanish)\n\n`
                    + `*Note:* This is a demo response. Connect to Google Translate API for actual translations.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: translateText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to translate text' }, { quoted: m })
                }
                break
            }

            case 'meme': {
                try {
                    const memeUrls = [
                        'https://i.imgur.com/dQw4w9W.jpg',
                        'https://i.imgur.com/kqVcP.jpg',
                        'https://i.imgur.com/9nVMRqa.jpg'
                    ]
                    const randomMeme = memeUrls[Math.floor(Math.random() * memeUrls.length)]
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        image: { url: randomMeme },
                        caption: `😂 *Random Meme*\n\n*Enjoy this meme!*`
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to get meme' }, { quoted: m })
                }
                break
            }

            case 'shorturl': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a URL to shorten!\n\nExample: ${prefix}shorturl https://google.com` }, { quoted: m })
                
                try {
                    // This is a demo response. You can integrate with URL shortening services
                    const shortText = `🔗 *URL Shortened*\n\n`
                    + `*Original:* ${text}\n`
                    + `*Shortened:* https://short.ly/abc123\n\n`
                    + `*Note:* This is a demo response. Connect to a URL shortening service for actual functionality.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: shortText }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to shorten URL' }, { quoted: m })
                }
                break
            }

            // Owner only commands
            case 'restart': {
                if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the owner!' }, { quoted: m })
                
                await XeonBotInc.sendMessage(m.chat, { text: '🔄 Restarting bot...' }, { quoted: m })
                process.exit()
                break
            }

            case 'eval': {
                if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the owner!' }, { quoted: m })
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide code to evaluate!' }, { quoted: m })
                
                try {
                    let evaled = await eval(text)
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `💻 *Eval Result:*\n\n\`\`\`${evaled}\`\`\`` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `❌ *Eval Error:*\n\n\`\`\`${error}\`\`\`` 
                    }, { quoted: m })
                }
                break
            }

            case 'exec': {
                if (!isOwner) return await XeonBotInc.sendMessage(m.chat, { text: '❌ This command is only for the owner!' }, { quoted: m })
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Please provide command to execute!' }, { quoted: m })
                
                try {
                    const { stdout, stderr } = await execAsync(text)
                    const result = stdout || stderr || 'Command executed successfully with no output'
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `💻 *Exec Result:*\n\n\`\`\`${result}\`\`\`` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `❌ *Exec Error:*\n\n\`\`\`${error.message}\`\`\`` 
                    }, { quoted: m })
                }
                break
            }

            case 'calculator':
            case 'calc': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide a mathematical expression!\n\nExample: ${prefix}calc 2+2` }, { quoted: m })
                
                try {
                    // Simple calculator - be careful with eval for security
                    const expression = text.replace(/[^0-9+\-*/().]/g, '')
                    if (!expression) throw new Error('Invalid expression')
                    
                    const result = eval(expression)
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `🧮 *Calculator*\n\n*Expression:* ${expression}\n*Result:* ${result}` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Invalid mathematical expression!' }, { quoted: m })
                }
                break
            }

            case 'dice':
            case 'roll': {
                const diceResult = Math.floor(Math.random() * 6) + 1
                const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
                
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `🎲 *Dice Roll*\n\n${diceEmojis[diceResult - 1]} You rolled: **${diceResult}**` 
                }, { quoted: m })
                break
            }

            case 'flip':
            case 'coin': {
                const coinResult = Math.random() < 0.5 ? 'Heads' : 'Tails'
                const coinEmoji = coinResult === 'Heads' ? '🪙' : '🔘'
                
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `🪙 *Coin Flip*\n\n${coinEmoji} Result: **${coinResult}**` 
                }, { quoted: m })
                break
            }

            case 'password':
            case 'pass': {
                const length = parseInt(args[0]) || 12
                if (length > 50) return await XeonBotInc.sendMessage(m.chat, { text: '❌ Password length cannot exceed 50 characters!' }, { quoted: m })
                
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
                let password = ''
                for (let i = 0; i < length; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length))
                }
                
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `🔐 *Password Generator*\n\n*Length:* ${length} characters\n*Password:* \`${password}\`\n\n⚠️ *Keep this password safe!*` 
                }, { quoted: m })
                break
            }

            case 'base64encode':
            case 'encode': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to encode!\n\nExample: ${prefix}encode Hello World` }, { quoted: m })
                
                try {
                    const encoded = Buffer.from(text).toString('base64')
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `🔐 *Base64 Encode*\n\n*Original:* ${text}\n*Encoded:* \`${encoded}\`` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to encode text' }, { quoted: m })
                }
                break
            }

            case 'base64decode':
            case 'decode': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide base64 text to decode!\n\nExample: ${prefix}decode SGVsbG8gV29ybGQ=` }, { quoted: m })
                
                try {
                    const decoded = Buffer.from(text, 'base64').toString('utf-8')
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `🔓 *Base64 Decode*\n\n*Encoded:* ${text}\n*Decoded:* ${decoded}` 
                    }, { quoted: m })
                } catch (error) {
                    await XeonBotInc.sendMessage(m.chat, { text: '❌ Invalid base64 string!' }, { quoted: m })
                }
                break
            }

            case 'yts':
            case 'ytsearch': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ *Please provide a search term!*\n\n*Example:* ${prefix + command} imagine dragons` }, { quoted: m })
                
                try {
                    let yts = require("yt-search")
                    let search = await yts(text)
                    let videos = search.all
                    
                    if (!videos || videos.length === 0) {
                        return await XeonBotInc.sendMessage(m.chat, { text: '❌ No videos found for your search' }, { quoted: m })
                    }

                    let message = `🔍 *YouTube Search Results*\n\n`
                    message += `📝 *Query:* ${text}\n`
                    message += `📊 *Results:* ${videos.length} found\n\n`
                    
                    const numVideos = Math.min(videos.length, 10)

                    for (let i = 0; i < numVideos; i++) {
                        const video = videos[i]
                        message += `*${i + 1}.* 📹 *${video.title}*\n`
                        message += `⏳ *Duration:* ${video.timestamp} (${video.seconds}s)\n`
                        message += `🗓️ *Uploaded:* ${video.ago}\n`
                        message += `👀 *Views:* ${video.views.toLocaleString()}\n`
                        message += `👤 *Channel:* ${video.author.name}\n`
                        message += `🔗 *URL:* ${video.url}\n\n`
                    }

                    message += `💡 *Tip:* Use ${prefix}play <song name> to download audio`

                    await XeonBotInc.sendMessage(m.chat, { text: message }, { quoted: m })

                } catch (error) {
                    console.error(error)
                    await XeonBotInc.sendMessage(m.chat, { text: '⚠️ Error occurred while searching YouTube. Please try again later.' }, { quoted: m })
                }
                break
            }

            case 'play':
            case 'song': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ *Please provide a song name!*\n\n*Example:* ${prefix + command} imagine dragons believer` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🔍 Searching for your song... Please wait.' }, { quoted: m })
                    
                    const yts = require("yt-search")
                    const axios = require('axios')
                    const fs = require('fs')
                    const path = require('path')
                    
                    let search = await yts(text)
                    if (!search.all[0]) {
                        return await XeonBotInc.sendMessage(m.chat, { text: '❌ Song not found! Please try a different search term.' }, { quoted: m })
                    }
                    
                    let video = search.all[0]
                    let link = video.url
                    
                    const searchingText = `🎵 *Found Song!*\n\n`
                    + `📹 *Title:* ${video.title}\n`
                    + `👤 *Channel:* ${video.author.name}\n`
                    + `⏱️ *Duration:* ${video.timestamp}\n`
                    + `👀 *Views:* ${video.views.toLocaleString()}\n\n`
                    + `⬇️ Downloading audio... Please wait.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: searchingText }, { quoted: m })

                    const apis = [
                        `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${link}`,
                        `https://api.dreaded.site/api/ytdl/audio?url=${link}`,
                        `https://xploader-api.vercel.app/ytmp3?url=${link}`,
                        `https://apis.davidcyriltech.my.id/youtube/mp3?url=${link}`
                    ]

                    let success = false
                    for (const api of apis) {
                        try {
                            let data = await fetchJson(api)
                            
                            if (data.status === 200 || data.success || data.result) {
                                let audioUrl = data.result?.downloadUrl || data.url || data.download_url
                                
                                if (audioUrl) {
                                    const audioCaption = `🎵 *${video.title}*\n\n`
                                    + `👤 *Channel:* ${video.author.name}\n`
                                    + `⏱️ *Duration:* ${video.timestamp}\n`
                                    + `👀 *Views:* ${video.views.toLocaleString()}\n\n`
                                    + `🤖 *Downloaded by ${global.botname}*`

                                    await XeonBotInc.sendMessage(m.chat, {
                                        audio: { url: audioUrl },
                                        mimetype: 'audio/mp4',
                                        caption: audioCaption,
                                        contextInfo: {
                                            externalAdReply: {
                                                title: video.title,
                                                body: `Channel: ${video.author.name} | Duration: ${video.timestamp}`,
                                                thumbnailUrl: video.thumbnail,
                                                sourceUrl: video.url,
                                                mediaType: 2,
                                                mediaUrl: video.url
                                            }
                                        }
                                    }, { quoted: m })
                                    
                                    success = true
                                    break
                                }
                            }
                        } catch (e) {
                            console.error(`API ${api} failed:`, e)
                            continue
                        }
                    }
                    
                    if (!success) {
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to download audio. All APIs might be down. Please try again later.' }, { quoted: m })
                    }
                    
                } catch (error) {
                    console.error(error)
                    await XeonBotInc.sendMessage(m.chat, { text: `❌ Download failed: ${error.message}` }, { quoted: m })
                }
                break
            }

            case 'video':
            case 'ytmp4': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ *Please provide a video name!*\n\n*Example:* ${prefix + command} imagine dragons believer` }, { quoted: m })
                
                try {
                    await XeonBotInc.sendMessage(m.chat, { text: '🔍 Searching for your video... Please wait.' }, { quoted: m })
                    
                    const yts = require("yt-search")
                    
                    let search = await yts(text)
                    if (!search.all[0]) {
                        return await XeonBotInc.sendMessage(m.chat, { text: '❌ Video not found! Please try a different search term.' }, { quoted: m })
                    }
                    
                    let video = search.all[0]
                    let link = video.url
                    
                    const searchingText = `🎥 *Found Video!*\n\n`
                    + `📹 *Title:* ${video.title}\n`
                    + `👤 *Channel:* ${video.author.name}\n`
                    + `⏱️ *Duration:* ${video.timestamp}\n`
                    + `👀 *Views:* ${video.views.toLocaleString()}\n\n`
                    + `⬇️ Downloading video... Please wait.`
                    
                    await XeonBotInc.sendMessage(m.chat, { text: searchingText }, { quoted: m })

                    const apis = [
                        `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${link}`,
                        `https://api.dreaded.site/api/ytdl/video?url=${link}`,
                        `https://xploader-api.vercel.app/ytmp4?url=${link}`
                    ]

                    let success = false
                    for (const api of apis) {
                        try {
                            let data = await fetchJson(api)
                            
                            if (data.status === 200 || data.success || data.result) {
                                let videoUrl = data.result?.downloadUrl || data.url || data.download_url
                                
                                if (videoUrl) {
                                    const videoCaption = `🎥 *${video.title}*\n\n`
                                    + `👤 *Channel:* ${video.author.name}\n`
                                    + `⏱️ *Duration:* ${video.timestamp}\n`
                                    + `👀 *Views:* ${video.views.toLocaleString()}\n\n`
                                    + `🤖 *Downloaded by ${global.botname}*`

                                    await XeonBotInc.sendMessage(m.chat, {
                                        video: { url: videoUrl },
                                        caption: videoCaption,
                                        contextInfo: {
                                            externalAdReply: {
                                                title: video.title,
                                                body: `Channel: ${video.author.name}`,
                                                thumbnailUrl: video.thumbnail,
                                                sourceUrl: video.url,
                                                mediaType: 1,
                                                mediaUrl: video.url
                                            }
                                        }
                                    }, { quoted: m })
                                    
                                    success = true
                                    break
                                }
                            }
                        } catch (e) {
                            console.error(`API ${api} failed:`, e)
                            continue
                        }
                    }
                    
                    if (!success) {
                        await XeonBotInc.sendMessage(m.chat, { text: '❌ Failed to download video. All APIs might be down. Please try again later.' }, { quoted: m })
                    }
                    
                } catch (error) {
                    console.error(error)
                    await XeonBotInc.sendMessage(m.chat, { text: `❌ Download failed: ${error.message}` }, { quoted: m })
                }
                break
            }

            case 'runtime':
            case 'uptime': {
                const uptimeText = `⏱️ *Bot Runtime*\n\n${runtime(process.uptime())}`
                await XeonBotInc.sendMessage(m.chat, { text: uptimeText }, { quoted: m })
                break
            }

            case 'owner': {
                const ownerText = `👤 *Bot Owner Information*\n\n`
                + `📱 *Number:* ${settings.owner}\n`
                + `🤖 *Bot:* ${global.botname}\n`
                + `💻 *Developer:* MR UNIQUE HACKER\n`
                + `🌐 *GitHub:* mrunqiuehacker\n`
                + `📺 *YouTube:* MR UNIQUE HACKER`

                await XeonBotInc.sendMessage(m.chat, { text: ownerText }, { quoted: m })
                break
            }


            case 'reverse': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to reverse!\n\nExample: ${prefix}reverse Hello` }, { quoted: m })
                
                const reversed = text.split('').reverse().join('')
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `🔄 *Text Reverser*\n\n*Original:* ${text}\n*Reversed:* ${reversed}` 
                }, { quoted: m })
                break
            }

            case 'uppercase':
            case 'upper': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to convert!\n\nExample: ${prefix}upper hello world` }, { quoted: m })
                
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `🔤 *Uppercase*\n\n*Original:* ${text}\n*Uppercase:* ${text.toUpperCase()}` 
                }, { quoted: m })
                break
            }

            case 'lowercase':
            case 'lower': {
                if (!text) return await XeonBotInc.sendMessage(m.chat, { text: `❌ Please provide text to convert!\n\nExample: ${prefix}lower HELLO WORLD` }, { quoted: m })
                
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `🔤 *Lowercase*\n\n*Original:* ${text}\n*Lowercase:* ${text.toLowerCase()}` 
                }, { quoted: m })
                break
            }

            default: {
                // If command not found, don't send any response to avoid spam
                break
            }
        }

    } catch (error) {
        console.error(chalk.red('[LADYBUG ERROR]'), error)
        await XeonBotInc.sendMessage(m.chat, { 
            text: '❌ An error occurred while processing the Ladybug command.' 
        }, { quoted: m }).catch(console.error)
    }
}

// Watch file for changes
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.yellow(`[LADYBUG] Updated ${__filename}`))
    delete require.cache[file]
})
0