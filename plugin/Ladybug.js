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
        const isCreator = isOwner // Add this line
        const text = args.join(" ")
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        const isMedia = /image|video|sticker|audio/.test(mime)

        // Add reply function
        const reply = (text) => {
            return XeonBotInc.sendMessage(m.chat, { text: text }, { quoted: m })
        }

        // Add runtime function if not available from lib
        function runtime(seconds) {
            seconds = Number(seconds);
            var d = Math.floor(seconds / (3600 * 24));
            var h = Math.floor(seconds % (3600 * 24) / 3600);
            var m = Math.floor(seconds % 3600 / 60);
            var s = Math.floor(seconds % 60);
            var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
            var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
            return dDisplay + hDisplay + mDisplay + sDisplay;
        }

        // Set global variables safely
        const botname = global.botname || settings.botname || 'LADYBUG BOT'
        const currentPrefix = global.prefix || settings.prefix || prefix

        // Only process messages that start with prefix
        if (!body.startsWith(prefix)) return

        console.log(chalk.blue(`[LADYBUG] Command: ${command} | From: ${pushname} | Chat: ${m.chat}`))

        // Command handlers with individual try-catch
        switch (command) {
            
            case 'menu':
            case 'help': {
                try {
                    // Function to read all cases from the current file
                    function getAllCases() {
                        try {
                            // Read the current file
                            const filePath = __filename;
                            const fileContent = fs.readFileSync(filePath, 'utf8');
                            
                            // Extract all case statements
                            const caseRegex = /case\s+['"`]([^'"`]+)['"`]:/g;
                            const cases = [];
                            let match;
                            
                            while ((match = caseRegex.exec(fileContent)) !== null) {
                                if (!cases.includes(match[1])) {
                                    cases.push(match[1]);
                                }
                            }
                            
                            return cases.sort();
                        } catch (error) {
                            console.log('Error reading cases:', error);
                            return ['menu', 'help', 'ping', 'owner', 'script', 'info', 'status', 'play', 'anime', 'joke', 'quote', 'fact', 'calculator'];
                        }
                    }

                    // Categorize commands
                    function categorizeCommands(cases) {
                        const categories = {
                            general: [],
                            youtube: [],
                            anime: [],
                            nsfw: [],
                            fun: [],
                            utility: [],
                            premium: [],
                            logo: [],
                            photo: [],
                            voice: [],
                            ai: [],
                            social: [],
                            owner: [],
                            other: []
                        };

                        cases.forEach(cmd => {
                            const command = cmd.toLowerCase();
                            
                            if (['ping', 'menu', 'help', 'runtime', 'owner', 'script', 'info', 'status'].includes(command)) {
                                categories.general.push(cmd);
                            } else if (['yts', 'play', 'song', 'video', 'ytmp4', 'youtube', 'yt'].includes(command)) {
                                categories.youtube.push(cmd);
                            } else if (['anime', 'waifu', 'neko', 'animepic', 'manga'].includes(command)) {
                                categories.anime.push(cmd);
                            } else if (['nsfw'].includes(command)) {
                                categories.nsfw.push(cmd);
                            } else if (['joke', 'quote', 'fact', 'meme', 'truth', 'dare', 'roast'].includes(command)) {
                                categories.fun.push(cmd);
                            } else if (['weather', 'translate', 'qr', 'shorturl', 'calculator', 'calc', 'base64', 'hash'].includes(command)) {
                                categories.utility.push(cmd);
                            } else if (['premium', 'vip', 'chatgpt', 'gpt', 'dalle', 'spotify', 'crypto'].includes(command)) {
                                categories.premium.push(cmd);
                            } else if (['logo', 'makelogo', 'textlogo', 'businesslogo', 'bizlogo', 'musiccover'].includes(command)) {
                                categories.logo.push(cmd);
                            } else if (['photoedit', 'editphoto', 'removebg', 'rembg', 'faceswap', 'enhance', 'upscale', 'collage'].includes(command)) {
                                categories.photo.push(cmd);
                            } else if (['voiceclone', 'clonevoice', 'voicechange', 'changevoice'].includes(command)) {
                                categories.voice.push(cmd);
                            } else if (['ai', 'openai', 'bard', 'claude'].includes(command)) {
                                categories.ai.push(cmd);
                            } else if (['igdl', 'instagram', 'tiktok', 'tt', 'twitter', 'fb'].includes(command)) {
                                categories.social.push(cmd);
                            } else if (['restart', 'eval', 'exec', 'broadcast', 'block', 'unblock', 'ban'].includes(command)) {
                                categories.owner.push(cmd);
                            } else {
                                categories.other.push(cmd);
                            }
                        });

                        return categories;
                    }

                    // Get daily menu style
                    function getDailyMenuStyle() {
                        const today = new Date().getDate();
                        const styles = [
                            'classic', 'modern', 'minimal', 'fancy', 'neon', 'retro', 'elegant'
                        ];
                        return styles[today % styles.length];
                    }

                    // Generate menu based on style
                    function generateMenu(style, categories, pushname, botname, prefix) {
                        let menuText = '';
                        const totalCommands = Object.values(categories).flat().length;

                        switch (style) {
                            case 'modern':
                                menuText = `╔══════════════════════════╗\n`;
                                menuText += `║    🤖 ${botname} MENU    ║\n`;
                                menuText += `╠══════════════════════════╣\n`;
                                menuText += `║ 👤 User: ${pushname}\n`;
                                menuText += `║ 📅 Date: ${new Date().toLocaleDateString()}\n`;
                                menuText += `║ ⏰ Time: ${new Date().toLocaleTimeString()}\n`;
                                menuText += `║ ⏱️ Uptime: ${runtime(process.uptime())}\n`;
                                menuText += `║ 📊 Commands: ${totalCommands}\n`;
                                menuText += `╚══════════════════════════╝\n\n`;
                                break;

                            case 'minimal':
                                menuText = `${botname}\n`;
                                menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
                                menuText += `User: ${pushname}\n`;
                                menuText += `Commands: ${totalCommands}\n`;
                                menuText += `Uptime: ${runtime(process.uptime())}\n\n`;
                                break;

                            default: // classic
                                menuText = `╭─────「 *${botname} MENU* 」─────╮\n`;
                                menuText += `│ 🤖 *Bot:* ${botname}\n`;
                                menuText += `│ 👤 *User:* ${pushname}\n`;
                                menuText += `│ 📅 *Date:* ${new Date().toLocaleDateString()}\n`;
                                menuText += `│ ⏰ *Time:* ${new Date().toLocaleTimeString()}\n`;
                                menuText += `│ ⏱️ *Uptime:* ${runtime(process.uptime())}\n`;
                                menuText += `│ 📊 *Commands:* ${totalCommands}\n`;
                                menuText += `╰─────────────────────────────╯\n\n`;
                                break;
                        }

                        // Add categories with commands
                        const categoryIcons = {
                            general: '⚙️',
                            youtube: '🎵',
                            anime: '🎌',
                            nsfw: '🔞',
                            fun: '🎮',
                            utility: '🛠️',
                            premium: '💎',
                            logo: '🎨',
                            photo: '📸',
                            voice: '🎤',
                            ai: '🤖',
                            social: '📱',
                            owner: '👑',
                            other: '📋'
                        };

                        Object.entries(categories).forEach(([category, commands]) => {
                            if (commands.length > 0) {
                                const icon = categoryIcons[category] || '📋';
                                const categoryName = category.toUpperCase().replace('_', ' ');
                                
                                menuText += `┌─⊷ *${icon} ${categoryName} COMMANDS*\n`;
                                commands.forEach(cmd => {
                                    menuText += `│• ${prefix}${cmd}\n`;
                                });
                                menuText += `└────────────⊷\n\n`;
                            }
                        });

                        menuText += `🐞 *Powered by Ladybug MD*\n`;
                        menuText += `💻 *Developer:* MR NTANDO OFC\n`;
                        menuText += `🎨 *Style:* ${style.toUpperCase()} (Changes Daily)`;

                        return menuText;
                    }

                    // Get all cases and categorize them
                    const allCases = getAllCases();
                    const categories = categorizeCommands(allCases);
                    const dailyStyle = getDailyMenuStyle();

                    // Generate menu with daily style
                    const menuText = generateMenu(dailyStyle, categories, pushname, botname, currentPrefix);

                    // Send menu text
                    await XeonBotInc.sendMessage(m.chat, {
                        text: menuText,
                        contextInfo: {
                            externalAdReply: {
                                title: `🐞 ${botname} - ${dailyStyle.toUpperCase()} Menu`,
                                body: `Total: ${Object.values(categories).flat().length} Commands`,
                                thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                                sourceUrl: 'https://github.com/mrnta-source',
                                mediaType: 1
                            }
                        }
                    }, { quoted: m });

                } catch (error) {
                    console.error('Menu command error:', error);
                    
                    // Fallback simple menu
                    const simpleMenu = `🐞 *LADYBUG BOT MENU*\n\n` +
                                      `📋 *Available Commands:*\n` +
                                      `• ${currentPrefix}ping - Check speed\n` +
                                      `• ${currentPrefix}menu - Show menu\n` +
                                      `• ${currentPrefix}owner - Owner info\n` +
                                      `• ${currentPrefix}play <song> - Download music\n` +
                                      `• ${currentPrefix}anime <type> - Anime pics\n\n` +
                                      `⚡ Bot is running smoothly!\n` +
                                      `💻 Developer: MR NTANDO OFC`;

                    await reply(simpleMenu);
                }
                break
            }

            case 'ping': {
                try {
                    const start = new Date().getTime();
                    const pingMsg = await XeonBotInc.sendMessage(m.chat, { text: '🏓 Pinging...' }, { quoted: m });
                    const end = new Date().getTime();
                    const ping = end - start;
                    
                    const pingText = `🏓 *PONG!*\n\n` +
                                    `📊 *Speed:* ${ping}ms\n` +
                                    `⚡ *Status:* Online\n` +
                                    `🤖 *Bot:* ${botname}\n` +
                                    `⏱️ *Uptime:* ${runtime(process.uptime())}\n` +
                                    `💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
                    
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: pingText,
                        edit: pingMsg.key 
                    });
                } catch (error) {
                    console.error('Ping error:', error);
                    await reply(`🏓 Pong! Bot is online!`);
                }
                break
            }

            case 'owner':
            case 'creator': {
                try {
                    const ownerText = `👑 *BOT OWNER INFORMATION*\n\n` +
                                     `📱 *Name:* MR NTANDO OFC\n` +
                                     `🐞 *Bot:* Ladybug MD\n` +
                                     `💻 *Developer:* MR NTANDO\n` +
                                     `🌐 *GitHub:* github.com/mrnta-source\n` +
                                     `📧 *Contact:* Owner Only\n` +
                                     `🎯 *Version:* 2.0.0\n\n` +
                                     `⚠️ *Note:* Don't spam the owner!`;
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: ownerText,
                        contextInfo: {
                            externalAdReply: {
                                title: "👑 Bot Owner - MR NTANDO OFC",
                                body: "Ladybug MD Developer",
                                thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                                sourceUrl: 'https://github.com/mrnta-source',
                                mediaType: 1
                            }
                        }
                    }, { quoted: m });
                } catch (error) {
                    console.error('Owner command error:', error);
                    await reply(`👑 *BOT OWNER*\n\n📱 *Name:* MR NTANDO OFC\n🐞 *Bot:* Ladybug MD\n💻 *Developer:* MR NTANDO`);
                }
                break
            }

            case 'play':
            case 'song': {
                try {
                    if (!text) return reply(`❌ Please provide a song name!\n\nExample: ${currentPrefix}play Despacito`);
                    
                    await reply('🔍 Searching for your song...');
                    
                    const searchText = `🎵 *YOUTUBE MUSIC SEARCH*\n\n` +
                                      `🔍 *Searching for:* ${text}\n` +
                                      `⏳ *Status:* Processing...\n\n` +
                                      `⚠️ *Note:* YouTube download feature is under development.\n` +
                                      `🔧 *Developer:* Working on implementation`;
                    
                    await XeonBotInc.sendMessage(m.chat, { text: searchText }, { quoted: m });
                } catch (error) {
                    console.error('Play command error:', error);
                    await reply('❌ Error occurred while searching for the song.');
                }
                break
            }

            case 'anime':
            case 'waifu': {
                try {
                    const animeTypes = ['waifu', 'neko', 'shinobu', 'megumin'];
                    
                    if (!text) {
                        const typesList = `🎌 *ANIME COMMANDS*\n\n` +
                                         `📝 *Usage:* ${currentPrefix}anime <type>\n\n` +
                                         `🎭 *Available Types:*\n` +
                                         animeTypes.map(type => `• ${type}`).join('\n') +
                                         `\n\n📌 *Example:* ${currentPrefix}anime waifu`;
                        
                        return reply(typesList);
                    }
                    
                    const requestedType = text.toLowerCase();
                    if (!animeTypes.includes(requestedType)) {
                        return reply(`❌ Invalid anime type! Use ${currentPrefix}anime to see available types.`);
                    }
                    
                    await reply('🎌 Getting anime image...');
                    
                    const animeText = `🎌 *ANIME IMAGE*\n\n` +
                                     `🎭 *Type:* ${requestedType}\n` +
                                     `⚠️ *Status:* Feature under development\n\n` +
                                     `🔧 *Note:* Anime API integration coming soon!`;
                    
                    await XeonBotInc.sendMessage(m.chat, { text: animeText }, { quoted: m });
                } catch (error) {
                    console.error('Anime command error:', error);
                    await reply('❌ Error fetching anime image.');
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
                        "Why did the math book look so sad? Because it had too many problems!"
                    ];
                    
                    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                    const jokeText = `😂 *RANDOM JOKE*\n\n${randomJoke}\n\n🎭 Hope that made you smile!`;
                    
                    await XeonBotInc.sendMessage(m.chat, { text: jokeText }, { quoted: m });
                } catch (error) {
                    console.error('Joke command error:', error);
                    await reply('😂 Here\'s a joke: Why did the bot break? It had too many bugs! 🐛');
                }
                break
            }

            case 'calculator':
            case 'calc': {
                try {
                    if (!text) return reply(`🧮 *CALCULATOR*\n\nUsage: ${currentPrefix}calc <expression>\n\nExample: ${currentPrefix}calc 2+2*3`);
                    
                    // Simple calculator (safer than eval)
                    const expression = text.replace(/[^0-9+\-*/().]/g, '');
                    if (!expression) return reply('❌ Invalid mathematical expression!');
                    
                    // Basic math evaluation (safer approach)
                    let result;
                    try {
                        result = Function(`"use strict"; return (${expression})`)();
                    } catch {
                        return reply('❌ Invalid mathematical expression!');
                    }
                    
                    const calcText = `🧮 *CALCULATOR*\n\n` +
                                    `📝 *Expression:* ${expression}\n` +
                                    `🔢 *Result:* ${result}\n\n` +
                                    `✅ Calculation completed!`;
                    
                    await XeonBotInc.sendMessage(m.chat, { text: calcText }, { quoted: m });
                } catch (error) {
                    console.error('Calculator error:', error);
                    await reply('❌ Error in calculation!');
                }
                break
            }

            case 'restart': {
                try {
                    if (!isOwner) return reply('❌ This command is only for the bot owner!');
                    
                    await reply('🔄 Restarting bot...');
                    process.exit();
                } catch (error) {
                    console.error('Restart error:', error);
                    await reply('❌ Error restarting bot!');
                }
                break
            }

            default: {
                // Command not found - don't send error message for unknown commands
                return;
            }
        }

    } catch (error) {
        console.error('Ladybug command handler error:', error);
        
        // Send error message only if it's a recognized command
        const recognizedCommands = ['menu', 'help', 'ping', 'owner', 'creator', 'play', 'song', 'anime', 'waifu', 'joke', 'calculator', 'calc', 'restart'];
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
        
        if (recognizedCommands.includes(command)) {
            try {
                await XeonBotInc.sendMessage(m.chat, { 
                    text: `❌ An error occurred while processing the Ladybug command.\n\n🔧 Please try again or contact the developer.` 
                }, { quoted: m });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}
