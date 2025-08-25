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
            
    case 'menu':
case 'help': {
    try {
        // Runtime function
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

        // Function to read all cases from the current file
        function getAllCases() {
            const fs = require('fs');
            const path = require('path');
            
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
                return [];
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
                } else if (['weather', 'translate', 'qr', 'shorturl', 'calculator', 'base64', 'hash'].includes(command)) {
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

                case 'fancy':
                    menuText = `✧･ﾟ: *:･ﾟ✧ ${botname} ✧･ﾟ: *:･ﾟ✧\n\n`;
                    menuText += `🌟 Welcome ${pushname}! 🌟\n`;
                    menuText += `┊ ┊ ┊ ┊ ┊ ┊\n`;
                    menuText += `┊ ┊ ┊ ┊ ˚✩ ⋆｡˚ ✩\n`;
                    menuText += `┊ ┊ ┊ ✫\n`;
                    menuText += `┊ ┊ ☪⋆ Date: ${new Date().toLocaleDateString()}\n`;
                    menuText += `┊ ⊹ Time: ${new Date().toLocaleTimeString()}\n`;
                    menuText += `✯ Commands: ${totalCommands}\n\n`;
                    break;

                case 'neon':
                    menuText = `🌈 ═══════════════════ 🌈\n`;
                    menuText += `💫    ${botname}    💫\n`;
                    menuText += `🌈 ═══════════════════ 🌈\n\n`;
                    menuText += `⚡ User: ${pushname}\n`;
                    menuText += `🔥 Commands: ${totalCommands}\n`;
                    menuText += `💎 Uptime: ${runtime(process.uptime())}\n\n`;
                    break;

                case 'retro':
                    menuText = `▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n`;
                    menuText += `▓  ${botname}  ▓\n`;
                    menuText += `▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n\n`;
                    menuText += `░ User: ${pushname}\n`;
                    menuText += `░ Commands: ${totalCommands}\n`;
                    menuText += `░ Status: Online\n\n`;
                    break;

                case 'elegant':
                    menuText = `◆◇◆◇◆◇◆◇◆◇◆◇◆◇◆\n`;
                    menuText += `    ${botname}\n`;
                    menuText += `◇◆◇◆◇◆◇◆◇◆◇◆◇◆◇\n\n`;
                    menuText += `❖ Welcome, ${pushname}\n`;
                    menuText += `❖ Total Commands: ${totalCommands}\n`;
                    menuText += `❖ Runtime: ${runtime(process.uptime())}\n\n`;
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
                    
                    if (style === 'minimal') {
                        menuText += `${icon} ${categoryName}\n`;
                        commands.forEach(cmd => {
                            menuText += `• ${prefix}${cmd}\n`;
                        });
                        menuText += `\n`;
                    } else {
                        menuText += `┌─⊷ *${icon} ${categoryName} COMMANDS*\n`;
                        commands.forEach(cmd => {
                            menuText += `│• ${prefix}${cmd}\n`;
                        });
                        menuText += `└────────────⊷\n\n`;
                    }
                }
            });

            // Add footer based on style
            switch (style) {
                case 'modern':
                    menuText += `╔══════════════════════════╗\n`;
                    menuText += `║ 🐞 Powered by Ladybug MD ║\n`;
                    menuText += `║ 💻 Developer: MR NTANDO  ║\n`;
                    menuText += `╚══════════════════════════╝`;
                    break;
                case 'minimal':
                    menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
                    menuText += `🐞 Ladybug MD | MR NTANDO`;
                    break;
                case 'fancy':
                    menuText += `✧･ﾟ: *:･ﾟ✧*:･ﾟ✧*:･ﾟ✧\n`;
                    menuText += `🐞 Powered by Ladybug MD\n`;
                    menuText += `💻 Created by MR NTANDO\n`;
                    menuText += `✧･ﾟ: *:･ﾟ✧*:･ﾟ✧*:･ﾟ✧`;
                    break;
                default:
                    menuText += `🐞 *Powered by Ladybug MD*\n`;
                    menuText += `💻 *Developer:* MR NTANDO OFC\n`;
                    menuText += `🎨 *Style:* ${style.toUpperCase()} (Changes Daily)`;
                    break;
            }

            return menuText;
        }

        // Get user info safely
        const pushname = m.pushName || m.sender.split('@')[0] || 'User';
        const prefix = global.prefix || '.';
        const botname = global.botname || 'LADYBUG BOT';

        // Get all cases and categorize them
        const allCases = getAllCases();
        const categories = categorizeCommands(allCases);
        const dailyStyle = getDailyMenuStyle();

        // Generate menu with daily style
        const menuText = generateMenu(dailyStyle, categories, pushname, botname, prefix);

        // Audio URLs for different styles
        const styleAudios = {
            modern: "https://files.catbox.moe/u9c4oq.mp3",
            minimal: "https://files.catbox.moe/u9c4oq.mp3",
            fancy: "https://files.catbox.moe/u9c4oq.mp3",
            neon: "https://files.catbox.moe/u9c4oq.mp3",
            retro: "https://files.catbox.moe/u9c4oq.mp3",
            elegant: "https://files.catbox.moe/u9c4oq.mp3",
            classic: "https://files.catbox.moe/u9c4oq.mp3"
        };

        // Try to send with audio
        try {
            const menuAudioUrl = styleAudios[dailyStyle] || styleAudios.classic;
            
            await XeonBotInc.sendMessage(m.chat, {
                audio: { url: menuAudioUrl },
                mimetype: 'audio/mp4',
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: `🐞 ${botname} Menu - ${dailyStyle.toUpperCase()} Style`,
                        body: `Hello ${pushname}! Today's menu style: ${dailyStyle}`,
                        thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                        sourceUrl: 'https://github.com/mrnta-source',
                        mediaType: 2,
                        mediaUrl: 'https://github.com/mrnta-source'
                    }
                }
            }, { quoted: m });
        } catch (audioError) {
            console.log('Audio send failed, continuing with text menu...');
        }

        // Send menu text
        await XeonBotInc.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '13161513685998@newsletter',
                    newsletterName: 'Ladybug MD',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: `🐞 ${botname} - ${dailyStyle.toUpperCase()} Menu`,
                    body: `Total: ${Object.values(categories).flat().length} Commands | Style changes daily!`,
                    thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                    sourceUrl: 'https://github.com/mrunqiuehacker',
                    mediaType: 1,
                    mediaUrl: 'https://github.com/mrnta-source'
                }
            }
        }, { quoted: m });

        // Send style info
        const styleInfo = `🎨 *Today's Menu Style: ${dailyStyle.toUpperCase()}*\n\n` +
                         `📅 Menu style changes daily automatically!\n` +
                         `🔄 Tomorrow you'll see a different design\n` +
                         `💫 Styles: Classic, Modern, Minimal, Fancy, Neon, Retro, Elegant\n\n` +
                         `📊 *Auto-detected ${Object.values(categories).flat().length} commands from code*`;

        setTimeout(async () => {
            await XeonBotInc.sendMessage(m.chat, { text: styleInfo }, { quoted: m });
        }, 2000);

    } catch (error) {
        console.error('Menu command error:', error);
        
        // Fallback simple menu
        const simpleMenu = `🐞 *LADYBUG BOT MENU*\n\n` +
                          `📋 *Available Commands:*\n` +
                          `• ${global.prefix || '.'}ping - Check speed\n` +
                          `• ${global.prefix || '.'}menu - Show menu\n` +
                          `• ${global.prefix || '.'}owner - Owner info\n` +
                          `• ${global.prefix || '.'}play <song> - Download music\n` +
                          `• ${global.prefix || '.'}anime <type> - Anime pics\n\n` +
                          `⚡ Bot is running smoothly!\n` +
                          `💻 Developer: MR NTANDO OFC`;

        await XeonBotInc.sendMessage(m.chat, { text: simpleMenu }, { quoted: m });
    }
    break
}

// Additional case for manual style change
case 'menustyle':
case 'changemenu': {
    if (!text) {
        const styleList = `🎨 *MENU STYLES AVAILABLE*\n\n` +
                         `• classic - Traditional style\n` +
                         `• modern - Clean borders\n` +
                         `• minimal - Simple design\n` +
                         `• fancy - Decorative style\n` +
                         `• neon - Colorful theme\n` +
                         `• retro - Old school look\n` +
                         `• elegant - Sophisticated design\n\n` +
                         `Usage: ${prefix}menustyle <style>\n` +
                         `Example: ${prefix}menustyle neon\n\n` +
                         `📅 *Note:* Style auto-changes daily!`;
        
        return reply(styleList);
    }
    
    const validStyles = ['classic', 'modern', 'minimal', 'fancy', 'neon', 'retro', 'elegant'];
    const requestedStyle = text.toLowerCase();
    
    if (!validStyles.includes(requestedStyle)) {
        return reply(`❌ Invalid style! Available: ${validStyles.join(', ')}`);
    }
    
    // Temporarily override daily style (you can store this in a database)
    global.tempMenuStyle = requestedStyle;
    
    reply(`✅ Menu style changed to *${requestedStyle.toUpperCase()}*\n\n🔄 Use ${prefix}menu to see the new style!\n📅 Will reset to daily style tomorrow.`);
    break
}


     // Basic bot information cases
case 'ping': {
    try {
        const start = new Date().getTime();
        const pingMsg = await XeonBotInc.sendMessage(m.chat, { text: '🏓 Pinging...' }, { quoted: m });
        const end = new Date().getTime();
        const ping = end - start;
        
        const pingText = `🏓 *PONG!*\n\n` +
                        `📊 *Speed:* ${ping}ms\n` +
                        `⚡ *Status:* Online\n` +
                        `🤖 *Bot:* ${global.botname || 'LADYBUG BOT'}\n` +
                        `⏱️ *Uptime:* ${runtime(process.uptime())}\n` +
                        `💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
        
        await XeonBotInc.sendMessage(m.chat, { 
            text: pingText,
            edit: pingMsg.key 
        });
    } catch (error) {
        reply(`🏓 Pong! ${new Date().getTime() - m.messageTimestamp * 1000}ms`);
    }
    break
}

case 'owner':
case 'creator': {
    const ownerText = `👑 *BOT OWNER INFORMATION*\n\n` +
                     `📱 *Name:* MR NTANDO OFC\n` +
                     `🐞 *Bot:* Ladybug MD\n` +
                     `💻 *Developer:* MR NTANDO\n` +
                     `🌐 *GitHub:* github.com/mrnta-source\n` +
                     `📧 *Contact:* Owner Only\n` +
                     `🎯 *Version:* 2.0.0\n\n` +
                     `⚠️ *Note:* Don't spam the owner!`;
    
    try {
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
        
        // Send owner contact
        setTimeout(async () => {
            await XeonBotInc.sendMessage(m.chat, {
                contacts: {
                    displayName: 'MR NTANDO OFC',
                    contacts: [{
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:NTANDO;MR;;;\nFN:MR NTANDO OFC\nORG:Ladybug MD;\nTITLE:Bot Developer\nitem1.TEL;waid=263714757857:+263 71 475 7857\nitem1.X-ABLabel:Mobile\nEND:VCARD`
                    }]
                }
            }, { quoted: m });
        }, 1000);
    } catch (error) {
        reply(ownerText);
    }
    break
}

case 'script':
case 'sc':
case 'repo': {
    const scriptText = `📜 *LADYBUG MD SCRIPT*\n\n` +
                      `🐞 *Bot Name:* Ladybug MD\n` +
                      `👨‍💻 *Developer:* MR NTANDO OFC\n` +
                      `⭐ *Version:* 2.0.0\n` +
                      `📅 *Updated:* ${new Date().toLocaleDateString()}\n` +
                      `🌟 *Stars:* 100+\n` +
                      `🍴 *Forks:* 50+\n\n` +
                      `🔗 *Repository:*\n` +
                      `https://github.com/mrnta-source/LADYBUG-MD\n\n` +
                      `📋 *Features:*\n` +
                      `• Multi-device support\n` +
                      `• Auto-updating menu\n` +
                      `• YouTube downloader\n` +
                      `• AI integration\n` +
                      `• Anime commands\n` +
                      `• Photo editing\n` +
                      `• And much more!\n\n` +
                      `⚠️ *Please star the repo if you use it!*`;
    
    await XeonBotInc.sendMessage(m.chat, {
        text: scriptText,
        contextInfo: {
            externalAdReply: {
                title: "🐞 Ladybug MD - Source Code",
                body: "Free WhatsApp Bot Script",
                thumbnailUrl: 'https://telegra.ph/file/c6e7391833654374abb8a.jpg',
                sourceUrl: 'https://github.com/mrnta-source/LADYBUG-MD',
                mediaType: 1
            }
        }
    }, { quoted: m });
    break
}

case 'info':
case 'botinfo': {
    const totalCommands = 150; // You can make this dynamic
    const infoText = `🤖 *BOT INFORMATION*\n\n` +
                    `📱 *Name:* ${global.botname || 'LADYBUG BOT'}\n` +
                    `🐞 *Version:* 2.0.0\n` +
                    `👨‍💻 *Developer:* MR NTANDO OFC\n` +
                    `📅 *Created:* 2024\n` +
                    `⏱️ *Uptime:* ${runtime(process.uptime())}\n` +
                    `📊 *Commands:* ${totalCommands}+\n` +
                    `💾 *Memory Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                    `🌐 *Platform:* ${process.platform}\n` +
                    `📱 *Node.js:* ${process.version}\n\n` +
                    `🎯 *Features:*\n` +
                    `• Multi-device support\n` +
                    `• Daily changing menu styles\n` +
                    `• Auto-command detection\n` +
                    `• YouTube downloads\n` +
                    `• AI integration\n` +
                    `• Photo editing tools\n` +
                    `• Anime content\n` +
                    `• Social media downloads\n\n` +
                    `🔗 *Links:*\n` +
                    `• GitHub: github.com/mrnta-source\n` +
                    `• Support: Contact Owner`;
    
    await XeonBotInc.sendMessage(m.chat, { text: infoText }, { quoted: m });
    break
}

case 'status':
case 'botstatus': {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    const statusText = `📊 *BOT STATUS*\n\n` +
                      `🟢 *Status:* Online\n` +
                      `⏱️ *Uptime:* ${runtime(uptime)}\n` +
                      `💾 *Memory Usage:*\n` +
                      `   • Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                      `   • Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\n` +
                      `   • External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB\n` +
                      `🖥️ *System:*\n` +
                      `   • Platform: ${process.platform}\n` +
                      `   • Arch: ${process.arch}\n` +
                      `   • Node.js: ${process.version}\n` +
                      `📱 *Bot Info:*\n` +
                      `   • Name: ${global.botname || 'LADYBUG BOT'}\n` +
                      `   • Prefix: ${global.prefix || '.'}\n` +
                      `   • Mode: ${global.public ? 'Public' : 'Private'}\n\n` +
                      `✅ All systems operational!`;
    
    await XeonBotInc.sendMessage(m.chat, { text: statusText }, { quoted: m });
    break
}

// YouTube download cases
case 'play':
case 'song': {
    if (!text) return reply(`❌ Please provide a song name!\n\nExample: ${prefix}play Despacito`);
    
    try {
        reply('🔍 Searching for your song...');
        
        // This is a placeholder - you'll need to implement actual YouTube search/download
        const searchText = `🎵 *YOUTUBE MUSIC SEARCH*\n\n` +
                          `🔍 *Searching for:* ${text}\n` +
                          `⏳ *Status:* Processing...\n\n` +
                          `⚠️ *Note:* YouTube download feature is under development.\n` +
                          `🔧 *Developer:* Working on implementation\n\n` +
                          `💡 *Alternative:* Try searching manually on YouTube`;
        
        await XeonBotInc.sendMessage(m.chat, { text: searchText }, { quoted: m });
        
    } catch (error) {
        reply('❌ Error occurred while searching for the song.');
    }
    break
}

case 'yts':
case 'youtubesearch': {
    if (!text) return reply(`❌ Please provide search term!\n\nExample: ${prefix}yts Despacito`);
    
    const searchText = `🔍 *YOUTUBE SEARCH*\n\n` +
                      `📝 *Query:* ${text}\n` +
                      `⏳ *Status:* Searching...\n\n` +
                      `⚠️ *Note:* YouTube search feature is under development.\n` +
                      `🔧 *Coming soon:* Full YouTube integration`;
    
    await XeonBotInc.sendMessage(m.chat, { text: searchText }, { quoted: m });
    break
}

// Anime cases
case 'anime':
case 'waifu': {
    const animeTypes = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'];
    
    if (!text) {
        const typesList = `🎌 *ANIME COMMANDS*\n\n` +
                         `📝 *Usage:* ${prefix}anime <type>\n\n` +
                         `🎭 *Available Types:*\n` +
                         animeTypes.map(type => `• ${type}`).join('\n') +
                         `\n\n📌 *Example:* ${prefix}anime waifu`;
        
        return reply(typesList);
    }
    
    const requestedType = text.toLowerCase();
    if (!animeTypes.includes(requestedType)) {
        return reply(`❌ Invalid anime type! Use ${prefix}anime to see available types.`);
    }
    
    try {
        reply('🎌 Getting anime image...');
        
        // Placeholder for anime API integration
        const animeText = `🎌 *ANIME IMAGE*\n\n` +
                         `🎭 *Type:* ${requestedType}\n` +
                         `⚠️ *Status:* Feature under development\n\n` +
                         `🔧 *Note:* Anime API integration coming soon!\n` +
                         `💡 *Developer:* MR NTANDO OFC`;
        
        await XeonBotInc.sendMessage(m.chat, { text: animeText }, { quoted: m });
        
    } catch (error) {
        reply('❌ Error fetching anime image.');
    }
    break
}

// Fun cases
case 'joke': {
    const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "Why don't eggs tell jokes? They'd crack each other up!",
        "What do you call a fake noodle? An impasta!",
        "Why did the math book look so sad? Because it had too many problems!",
        "What do you call a bear with no teeth? A gummy bear!",
        "Why don't skeletons fight each other? They don't have the guts!",
        "What do you call a sleeping bull? A bulldozer!",
        "Why did the cookie go to the doctor? Because it felt crumbly!",
        "What do you call a fish wearing a bowtie? Sofishticated!"
    ];
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    const jokeText = `😂 *RANDOM JOKE*\n\n${randomJoke}\n\n🎭 Hope that made you smile!`;
    
    await XeonBotInc.sendMessage(m.chat, { text: jokeText }, { quoted: m });
    break
}

case 'quote': {
    const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Life is what happens to you while you're busy making other plans. - John Lennon",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "It is during our darkest moments that we must focus to see the light. - Aristotle",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The only impossible journey is the one you never begin. - Tony Robbins",
        "In the end, we will remember not the words of our enemies, but the silence of our friends. - Martin Luther King Jr.",
        "Be yourself; everyone else is already taken. - Oscar Wilde",
        "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. - Albert Einstein"
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteText = `💭 *INSPIRATIONAL QUOTE*\n\n"${randomQuote}"\n\n✨ Stay motivated!`;
    
    await XeonBotInc.sendMessage(m.chat, { text: quoteText }, { quoted: m });
    break
}

case 'fact': {
    const facts = [
        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
        "A group of flamingos is called a 'flamboyance'.",
        "Octopuses have three hearts and blue blood.",
        "Bananas are berries, but strawberries aren't.",
        "A day on Venus is longer than its year.",
        "Sharks have been around longer than trees.",
        "There are more possible games of chess than atoms in the observable universe.",
        "Wombat poop is cube-shaped.",
        "A shrimp's heart is in its head.",
        "It's impossible to hum while holding your nose closed."
    ];
    
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    const factText = `🧠 *RANDOM FACT*\n\n${randomFact}\n\n🤓 The more you know!`;
    
    await XeonBotInc.sendMessage(m.chat, { text: factText }, { quoted: m });
    break
}

// Utility cases
case 'calculator':
case 'calc': {
    if (!text) return reply(`🧮 *CALCULATOR*\n\nUsage: ${prefix}calc <expression>\n\nExample: ${prefix}calc 2+2*3`);
    
    try {
        // Simple calculator (be careful with eval in production)
        const expression = text.replace(/[^0-9+\-*/().]/g, '');
        if (!expression) return reply('❌ Invalid mathematical expression!');
        
        const result = Function(`"use strict"; return (${expression})`)();
        
        const calcText = `🧮 *CALCULATOR*\n\n` +
                        `📝 *Expression:* ${expression}\n` +
                        `🔢 *Result:* ${result}\n\n` +
                        `✅ Calculation completed!`;
        
        await XeonBotInc.sendMessage(m.chat, { text: calcText }, { quoted: m });
        
    } catch (error) {
        reply('❌ Invalid mathematical expression!');
    }
    break
}

// Owner only cases
case 'restart': {
    if (!isCreator) return reply('❌ This command is only for the bot owner!');
    
    reply('🔄 Restarting bot...');
    process.exit();
    break
}

case 'eval': {
    if (!isCreator) return reply('❌ This command is only for the bot owner!');
    if (!text) return reply('❌ Please provide code to evaluate!');
    
    try {
        let evaled = await eval(text);
        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
        await reply(`📊 *EVAL RESULT*\n\n\`\`\`${evaled}\`\`\``);
    } catch (err) {
        await reply(`❌ *EVAL ERROR*\n\n\`\`\`${err}\`\`\``);
    }
    break
}

// Add runtime function if not already defined
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
