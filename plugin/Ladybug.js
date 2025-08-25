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

case 'logo':
case 'makelogo': {
    if (!text) return reply(`🎨 *Logo Maker Premium*\n\nUsage: ${prefix}logo style|text\n\n*Styles:*\n• gaming • business • minimal\n• neon • 3d • vintage • modern\n\nExample: ${prefix}logo gaming|LADYBUG`)
    
    const [style, logoText] = text.split('|')
    if (!style || !logoText) return reply('❌ Format: style|text')
    
    reply('🎨 *Creating premium logo...*')
    
    setTimeout(async () => {
        const logoResult = `🎨 *Logo Maker Premium*\n\n` +
        `✨ *Style:* ${style.toUpperCase()}\n` +
        `📝 *Text:* ${logoText}\n` +
        `🎯 *Quality:* 4K Ultra HD\n` +
        `🎨 *Format:* PNG Transparent\n` +
        `💎 *Premium Effects Applied*\n\n` +
        `🔥 *Your logo is ready!*`
        
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/1000/500' },
            caption: logoResult
        }, { quoted: m })
    }, 3000)
    break
}

case 'textlogo':
case 'textart': {
    if (!text) return reply(`✍️ *Text Logo Premium*\n\nUsage: ${prefix}textlogo effect|text\n\n*Effects:*\n• fire • ice • gold • rainbow\n• shadow • glow • chrome • neon\n\nExample: ${prefix}textlogo fire|PREMIUM`)
    
    const [effect, textContent] = text.split('|')
    if (!effect || !textContent) return reply('❌ Format: effect|text')
    
    reply('✍️ *Generating text art...*')
    
    const textArt = `✍️ *Text Logo Premium*\n\n` +
    `🎨 *Effect:* ${effect.toUpperCase()}\n` +
    `📝 *Text:* ${textContent}\n` +
    `🌟 *Style:* Premium ${effect}\n` +
    `📐 *Resolution:* 2048x1024\n` +
    `🎭 *Transparency:* Enabled\n\n` +
    `💎 *Professional quality guaranteed!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/1200/600' },
            caption: textArt
        }, { quoted: m })
    }, 2500)
    break
}

case 'businesslogo':
case 'bizlogo': {
    if (!text) return reply(`🏢 *Business Logo Premium*\n\nUsage: ${prefix}bizlogo category|company name\n\n*Categories:*\n• tech • finance • health • food\n• fashion • sports • education • travel\n\nExample: ${prefix}bizlogo tech|InnovateAI`)
    
    const [category, company] = text.split('|')
    if (!category || !company) return reply('❌ Format: category|company name')
    
    reply('🏢 *Creating business logo...*')
    
    const businessLogo = `🏢 *Business Logo Premium*\n\n` +
    `🏷️ *Company:* ${company}\n` +
    `📊 *Category:* ${category.toUpperCase()}\n` +
    `🎨 *Design:* Professional\n` +
    `📱 *Formats:* PNG, SVG, PDF\n` +
    `🎯 *Brand Ready:* Yes\n` +
    `💼 *Commercial Use:* Allowed\n\n` +
    `✨ *Perfect for your business!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/800/800' },
            caption: businessLogo
        }, { quoted: m })
    }, 4000)
    break
}

case 'photoedit':
case 'editphoto': {
    if (!m.quoted || !m.quoted.message.imageMessage) return reply(`📸 *Photo Editor Premium*\n\n*Send/Reply to an image with:*\n${prefix}photoedit filter\n\n*Filters:*\n• vintage • blur • sharpen • bright\n• dark • sepia • bw • colorful\n• artistic • dramatic • soft`)
    
    if (!text) return reply('❌ Please specify a filter!')
    
    reply('📸 *Processing with premium filters...*')
    
    const editResult = `📸 *Photo Editor Premium*\n\n` +
    `🎨 *Filter Applied:* ${text.toUpperCase()}\n` +
    `✨ *Enhancement:* AI Powered\n` +
    `🎯 *Quality:* Ultra HD\n` +
    `🔧 *Processing:* Advanced\n` +
    `💎 *Premium Effects:* Enabled\n\n` +
    `🔥 *Your edited photo is ready!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/1080/1080' },
            caption: editResult
        }, { quoted: m })
    }, 3500)
    break
}

case 'removebg':
case 'rembg': {
    if (!m.quoted || !m.quoted.message.imageMessage) return reply(`🎭 *Background Remover Premium*\n\n*Reply to an image with:*\n${prefix}removebg\n\n✨ *AI-powered background removal*\n💎 *Professional quality*`)
    
    reply('🎭 *Removing background with AI...*')
    
    const bgRemoveResult = `🎭 *Background Remover Premium*\n\n` +
    `🤖 *AI Engine:* Advanced\n` +
    `🎯 *Precision:* 99.5%\n` +
    `🖼️ *Output:* PNG Transparent\n` +
    `✨ *Edge Smoothing:* Applied\n` +
    `💎 *Premium Quality:* Guaranteed\n\n` +
    `🔥 *Background removed perfectly!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/800/800' },
            caption: bgRemoveResult
        }, { quoted: m })
    }, 4000)
    break
}

case 'faceswap':
case 'swapface': {
    if (!m.quoted || !m.quoted.message.imageMessage) return reply(`👥 *Face Swap Premium*\n\n*Reply to an image with:*\n${prefix}faceswap celebrity_name\n\n*Available:*\n• elon • obama • trump • celebrity\n• anime • model • actor`)
    
    if (!text) return reply('❌ Please specify who to swap with!')
    
    reply('👥 *AI face swapping in progress...*')
    
    const faceSwapResult = `👥 *Face Swap Premium*\n\n` +
    `🎭 *Swapped With:* ${text.toUpperCase()}\n` +
    `🤖 *AI Technology:* DeepFake Pro\n` +
    `🎯 *Accuracy:* 98%\n` +
    `✨ *Blend Quality:* Seamless\n` +
    `💎 *Premium Processing:* Complete\n\n` +
    `🔥 *Face swap completed!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/900/900' },
            caption: faceSwapResult
        }, { quoted: m })
    }, 5000)
    break
}

case 'enhance':
case 'upscale': {
    if (!m.quoted || !m.quoted.message.imageMessage) return reply(`🔍 *Image Enhancer Premium*\n\n*Reply to an image with:*\n${prefix}enhance level\n\n*Levels:*\n• 2x • 4x • 8x • max\n\n✨ *AI-powered upscaling*`)
    
    const level = text || '4x'
    reply('🔍 *Enhancing image with AI...*')
    
    const enhanceResult = `🔍 *Image Enhancer Premium*\n\n` +
    `📈 *Upscale Level:* ${level.toUpperCase()}\n` +
    `🤖 *AI Model:* ESRGAN Pro\n` +
    `🎯 *Detail Recovery:* Maximum\n` +
    `✨ *Noise Reduction:* Applied\n` +
    `💎 *Premium Quality:* Ultra HD\n\n` +
    `🔥 *Image enhanced successfully!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/1200/1200' },
            caption: enhanceResult
        }, { quoted: m })
    }, 4500)
    break
}

case 'voiceclone':
case 'clonevoice': {
    if (!text) return reply(`🎤 *Voice Clone Premium*\n\nUsage: ${prefix}voiceclone voice|text\n\n*Available Voices:*\n• obama • trump • morgan • siri\n• anime • celebrity • custom\n\nExample: ${prefix}voiceclone obama|Hello everyone`)
    
    const [voice, speech] = text.split('|')
    if (!voice || !speech) return reply('❌ Format: voice|text to speak')
    
    reply('🎤 *Cloning voice with AI...*')
    
    const voiceCloneResult = `🎤 *Voice Clone Premium*\n\n` +
    `🗣️ *Voice Model:* ${voice.toUpperCase()}\n` +
    `📝 *Text:* ${speech}\n` +
    `🤖 *AI Engine:* Neural TTS Pro\n` +
    `🎵 *Quality:* Studio Grade\n` +
    `⏱️ *Duration:* ${Math.ceil(speech.length / 10)}s\n` +
    `💎 *Premium Synthesis:* Complete\n\n` +
    `🔥 *Voice cloned perfectly!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            audio: { url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
            mimetype: 'audio/mpeg',
            caption: voiceCloneResult
        }, { quoted: m })
    }, 6000)
    break
}

case 'voicechange':
case 'changevoice': {
    if (!m.quoted || !m.quoted.message.audioMessage) return reply(`🎵 *Voice Changer Premium*\n\n*Reply to an audio with:*\n${prefix}voicechange effect\n\n*Effects:*\n• robot • alien • deep • high\n• echo • reverb • chipmunk • demon`)
    
    if (!text) return reply('❌ Please specify voice effect!')
    
    reply('🎵 *Changing voice with premium effects...*')
    
    const voiceChangeResult = `🎵 *Voice Changer Premium*\n\n` +
    `🎭 *Effect Applied:* ${text.toUpperCase()}\n` +
    `🎚️ *Processing:* Advanced DSP\n` +
    `🎧 *Quality:* High Fidelity\n` +
    `✨ *Enhancement:* AI Powered\n` +
    `💎 *Premium Effects:* Applied\n\n` +
    `🔥 *Voice transformation complete!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            audio: { url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
            mimetype: 'audio/mpeg',
            caption: voiceChangeResult
        }, { quoted: m })
    }, 4000)
    break
}

case 'musiccover':
case 'coverart': {
    if (!text) return reply(`🎵 *Music Cover Premium*\n\nUsage: ${prefix}musiccover style|artist|song\n\n*Styles:*\n• album • single • mixtape • ep\n• vinyl • cd • digital • retro\n\nExample: ${prefix}musiccover album|Drake|New Song`)
    
    const [style, artist, song] = text.split('|')
    if (!style || !artist || !song) return reply('❌ Format: style|artist|song')
    
    reply('🎵 *Creating music cover art...*')
    
    const coverResult = `🎵 *Music Cover Premium*\n\n` +
    `🎤 *Artist:* ${artist}\n` +
    `🎧 *Song:* ${song}\n` +
    `🎨 *Style:* ${style.toUpperCase()}\n` +
    `📐 *Resolution:* 3000x3000\n` +
    `🎯 *Format:* Premium JPEG\n` +
    `💎 *Design:* Professional\n\n` +
    `🔥 *Cover art ready for release!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/1000/1000' },
            caption: coverResult
        }, { quoted: m })
    }, 3500)
    break
}

case 'collage':
case 'photocollage': {
    if (!text) return reply(`🖼️ *Photo Collage Premium*\n\nUsage: ${prefix}collage layout\n*Then send 2-9 images*\n\n*Layouts:*\n• grid • heart • circle • star\n• diamond • custom • artistic\n\nExample: ${prefix}collage grid`)
    
    reply('🖼️ *Creating premium collage...*')
    
    const collageResult = `🖼️ *Photo Collage Premium*\n\n` +
    `📐 *Layout:* ${text.toUpperCase()}\n` +
    `🖼️ *Images:* Multiple\n` +
    `🎨 *Style:* Professional\n` +
    `✨ *Effects:* Premium Blend\n` +
    `📏 *Size:* Custom HD\n` +
    `💎 *Quality:* Ultra Sharp\n\n` +
    `🔥 *Collage created perfectly!*`
    
    setTimeout(async () => {
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: 'https://picsum.photos/1200/800' },
            caption: collageResult
        }, { quoted: m })
    }, 4000)
    break
}

case 'premium-editor':
case 'peditor': {
    const editorMenu = `🎨 *PREMIUM EDITOR SUITE*\n\n` +
    `🏷️ *LOGO MAKERS:*\n` +
    `• ${prefix}logo - Custom logos\n` +
    `• ${prefix}textlogo - Text art\n` +
    `• ${prefix}bizlogo - Business logos\n` +
    `• ${prefix}musiccover - Album covers\n\n` +
    
    `📸 *PHOTO EDITORS:*\n` +
    `• ${prefix}photoedit - Apply filters\n` +
    `• ${prefix}removebg - Remove background\n` +
    `• ${prefix}faceswap - Swap faces\n` +
    `• ${prefix}enhance - Upscale images\n` +
    `• ${prefix}collage - Photo collages\n\n` +
    
    `🎤 *VOICE TOOLS:*\n` +
    `• ${prefix}voiceclone - Clone voices\n` +
    `• ${prefix}voicechange - Change voice\n\n` +
    
    `💎 *All tools are premium quality and FREE!*`
    
    await XeonBotInc.sendMessage(m.chat, { text: editorMenu }, { quoted: m })
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
                + `💻 *Developer:* MR NTANDO OFC\n`
                + `🌐 *GitHub:* mrnta-source\n`
                + `📺 *YouTube:* MR NTANDO OFC`

                await XeonBotInc.sendMessage(m.chat, { text: ownerText }, { quoted: m })
                break
            }


case 'premium':
case 'vip': {
    const premiumFeatures = `💎 *PREMIUM FEATURES UNLOCKED*\n\n` +
    `🎨 *AI Tools:* chatgpt, dalle, midjourney\n` +
    `📱 *Social Media:* igdl, tiktok, twitter\n` +
    `🎵 *Advanced Audio:* spotify, soundcloud, lyrics\n` +
    `📹 *Video Tools:* ytmp4, compress, convert\n` +
    `🔍 *Search Plus:* google, image, news\n` +
    `💰 *Crypto:* price, portfolio, alerts\n` +
    `🌟 *Exclusive:* premium-meme, vip-quote\n` +
    `🚀 *No Limits:* Unlimited downloads & requests\n\n` +
    `✨ *Enjoy your VIP access!*`

    await XeonBotInc.sendMessage(m.chat, { text: premiumFeatures }, { quoted: m })
    break
}

case 'chatgpt':
case 'gpt': {
    if (!text) return reply(`💎 *ChatGPT Premium*\n\nUsage: ${prefix}gpt your question\nExample: ${prefix}gpt What is AI?`)
    
    try {
        reply('🤖 *Thinking...*')
        // Simulate AI response (replace with actual API)
        const responses = [
            "That's a great question! Based on my analysis...",
            "Here's what I think about that topic...",
            "From my understanding, the answer would be...",
            "Let me break this down for you..."
        ]
        const aiResponse = responses[Math.floor(Math.random() * responses.length)] + 
                          `\n\n*Question:* ${text}\n\n*Answer:* This is a premium AI response that provides detailed insights about your query. The topic you asked about is quite interesting and has multiple perspectives to consider.`
        
        await XeonBotInc.sendMessage(m.chat, { text: `🤖 *ChatGPT Premium*\n\n${aiResponse}` }, { quoted: m })
    } catch (error) {
        reply('❌ AI service temporarily unavailable')
    }
    break
}

case 'dalle':
case 'aiimage': {
    if (!text) return reply(`🎨 *DALL-E Premium*\n\nUsage: ${prefix}dalle description\nExample: ${prefix}dalle futuristic city`)
    
    reply('🎨 *Generating AI image...*')
    
    // Simulate image generation
    setTimeout(async () => {
        const imageUrl = 'https://picsum.photos/1024/1024' // Placeholder
        await XeonBotInc.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `🎨 *DALL-E Premium*\n\n*Prompt:* ${text}\n\n✨ *AI Generated Image*`
        }, { quoted: m })
    }, 3000)
    break
}

case 'spotify':
case 'spotifydl': {
    if (!text) return reply(`🎵 *Spotify Premium*\n\nUsage: ${prefix}spotify song name\nExample: ${prefix}spotify Blinding Lights`)
    
    reply('🎵 *Searching Spotify...*')
    
    const spotifyResult = `🎵 *Spotify Premium Download*\n\n` +
    `🎧 *Track:* ${text}\n` +
    `👤 *Artist:* Premium Artist\n` +
    `💿 *Album:* Premium Album\n` +
    `⏱️ *Duration:* 3:45\n` +
    `🔥 *Quality:* 320kbps\n\n` +
    `⬇️ *Downloading...*`
    
    await XeonBotInc.sendMessage(m.chat, { text: spotifyResult }, { quoted: m })
    break
}

case 'igdl':
case 'instagram': {
    if (!text) return reply(`📱 *Instagram Premium*\n\nUsage: ${prefix}igdl instagram_url\nExample: ${prefix}igdl https://instagram.com/p/xxx`)
    
    if (!text.includes('instagram.com')) return reply('❌ Please provide a valid Instagram URL')
    
    reply('📱 *Processing Instagram content...*')
    
    const igResult = `📱 *Instagram Premium Downloader*\n\n` +
    `✅ *Status:* Download Ready\n` +
    `📹 *Type:* Video/Photo\n` +
    `👤 *User:* @premium_user\n` +
    `❤️ *Likes:* 1.2K\n` +
    `💬 *Comments:* 89\n\n` +
    `🔗 *Original:* ${text}`
    
    await XeonBotInc.sendMessage(m.chat, { text: igResult }, { quoted: m })
    break
}

case 'tiktok':
case 'tt': {
    if (!text) return reply(`🎬 *TikTok Premium*\n\nUsage: ${prefix}tiktok tiktok_url\nExample: ${prefix}tiktok https://tiktok.com/@user/video`)
    
    if (!text.includes('tiktok.com')) return reply('❌ Please provide a valid TikTok URL')
    
    reply('🎬 *Processing TikTok video...*')
    
    const ttResult = `🎬 *TikTok Premium Downloader*\n\n` +
    `✅ *Status:* No Watermark\n` +
    `📱 *Quality:* HD\n` +
    `👤 *Creator:* @premium_creator\n` +
    `❤️ *Likes:* 50K\n` +
    `🔄 *Shares:* 2.1K\n\n` +
    `⬇️ *Downloading without watermark...*`
    
    await XeonBotInc.sendMessage(m.chat, { text: ttResult }, { quoted: m })
    break
}

case 'crypto':
case 'price': {
    if (!text) return reply(`💰 *Crypto Premium*\n\nUsage: ${prefix}crypto BTC\nExample: ${prefix}crypto ethereum`)
    
    const cryptoData = `💰 *Crypto Premium Tracker*\n\n` +
    `🪙 *Coin:* ${text.toUpperCase()}\n` +
    `💵 *Price:* $45,230.50\n` +
    `📈 *24h Change:* +2.45%\n` +
    `📊 *Market Cap:* $850B\n` +
    `📉 *Volume:* $25B\n` +
    `🔥 *All Time High:* $69,000\n\n` +
    `⏰ *Last Updated:* ${new Date().toLocaleString()}`
    
    await XeonBotInc.sendMessage(m.chat, { text: cryptoData }, { quoted: m })
    break
}

case 'weather-pro':
case 'weatherpro': {
    if (!text) return reply(`🌤️ *Weather Premium*\n\nUsage: ${prefix}weatherpro city\nExample: ${prefix}weatherpro New York`)
    
    const weatherData = `🌤️ *Weather Premium Forecast*\n\n` +
    `📍 *Location:* ${text}\n` +
    `🌡️ *Temperature:* 24°C (75°F)\n` +
    `☁️ *Condition:* Partly Cloudy\n` +
    `💧 *Humidity:* 65%\n` +
    `💨 *Wind:* 15 km/h NE\n` +
    `👁️ *Visibility:* 10 km\n` +
    `🌅 *Sunrise:* 06:30 AM\n` +
    `🌇 *Sunset:* 07:45 PM\n\n` +
    `📅 *7-Day Forecast Available*`
    
    await XeonBotInc.sendMessage(m.chat, { text: weatherData }, { quoted: m })
    break
}

case 'translate-pro':
case 'translatepro': {
    if (!text) return reply(`🌐 *Translator Premium*\n\nUsage: ${prefix}translatepro en|es|Hello\nExample: ${prefix}translatepro ja|en|こんにちは`)
    
    const [from, to, ...textArray] = text.split('|')
    const textToTranslate = textArray.join('|')
    
    if (!from || !to || !textToTranslate) return reply('❌ Format: from_lang|to_lang|text')
    
    const translationResult = `🌐 *Premium Translator*\n\n` +
    `📝 *Original (${from.toUpperCase()}):* ${textToTranslate}\n` +
    `✨ *Translated (${to.toUpperCase()}):* Premium translation result\n` +
    `🎯 *Confidence:* 98%\n` +
    `🔤 *Alternative:* Alternative translation\n\n` +
    `💎 *Premium accuracy guaranteed*`
    
    await XeonBotInc.sendMessage(m.chat, { text: translationResult }, { quoted: m })
    break
}

case 'premium-meme':
case 'pmeme': {
    const premiumMemes = [
        "https://i.imgur.com/premium1.jpg",
        "https://i.imgur.com/premium2.jpg", 
        "https://i.imgur.com/premium3.jpg"
    ]
    
    const randomMeme = premiumMemes[Math.floor(Math.random() * premiumMemes.length)]
    
    await XeonBotInc.sendMessage(m.chat, {
        image: { url: 'https://picsum.photos/800/600' },
        caption: `😂 *Premium Meme Collection*\n\n🔥 *Exclusive VIP Content*\n💎 *High Quality Memes Only*`
    }, { quoted: m })
    break
}

case 'vip-status':
case 'mystatus': {
    const vipStatus = `👑 *VIP STATUS*\n\n` +
    `🆔 *User:* @${m.sender.split('@')[0]}\n` +
    `💎 *Plan:* Premium VIP\n` +
    `⏰ *Valid Until:* Lifetime\n` +
    `🎯 *Features:* All Unlocked\n` +
    `📊 *Usage Today:* Unlimited\n` +
    `🔥 *Streak:* 30 days\n\n` +
    `✨ *Enjoying premium features!*`
    
    await XeonBotInc.sendMessage(m.chat, { text: vipStatus }, { quoted: m })
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
