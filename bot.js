const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Telegram BOT TOKEN from env
const bot = new Telegraf(process.env.8788084813:AAFMirMmK0ykr6NqdOqXO1y6s5FkZJOH6Rg);

// ------------------ UI BUTTONS ------------------ //
bot.start((ctx) => {
    ctx.reply(
`🔐 *VPN Config Parser*

Send any VPN config file and I'll extract the connection details.

✅ Supported outputs: vless:// • vmess:// • trojan:// • ssh://

📦 Supported input formats:
• V2Ray / Xray
• HTTP Custom
• Dark Tunnel
• AuraNet / HA Tunnel / SlowDNS

Tap Help below for more info.`,
        {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("📖 Help", "help"), Markup.button.callback("ℹ️ About", "about")],
                [Markup.button.callback("🛡 Credits", "credits")]
            ])
        }
    );
});

// Help
bot.action("help", (ctx) => {
    ctx.editMessageText(
`📖 *Help*

1️⃣ Send your VPN config file 📁  
2️⃣ Bot auto detects and extracts configs

Supported formats: .json, .txt, .conf, .ovpn, any VPN file`,
        { parse_mode: "Markdown" }
    );
});

// About
bot.action("about", (ctx) => {
    ctx.editMessageText(
`ℹ️ *About Bot*

Extracts VPN configs like:
VLESS / VMESS / Trojan / SSH / Dark Tunnel / HTTP Custom / AuraNet / HA Tunnel / SlowDNS

⚡ Fast • Clean • Accurate`,
        { parse_mode: "Markdown" }
    );
});

// Credits
bot.action("credits", (ctx) => {
    ctx.editMessageText(
`☠︎ *Credits*

𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪

Bot developed by us 😎`,
        { parse_mode: "Markdown" }
    );
});

// ------------------ FILE HANDLER ------------------ //
bot.on('document', async (ctx) => {
    try {
        const file = ctx.message.document;
        const fileLink = await ctx.telegram.getFileLink(file.file_id);

        const res = await axios.get(fileLink.href);
        const content = res.data.toString();

        // Regexes for multi-format
        const regexes = {
            VLESS: /vless:\/\/[^\s'"]+/g,
            VMESS: /vmess:\/\/[^\s'"]+/g,
            TROJAN: /trojan:\/\/[^\s'"]+/g,
            SSH: /ssh:\/\/[^\s'"]+/g
        };

        let outputText = "✅ *Extracted Configs:*\n━━━━━━━━━━━━━━━━━━━━\n\n";
        let foundAny = false;

        for (let type in regexes) {
            const matches = content.match(regexes[type]);
            if (matches) {
                foundAny = true;
                for (let url of matches) {
                    outputText += `⚠️ *${type}*\n\n`;

                    try {
                        if (type === "VLESS" || type === "TROJAN" || type === "SSH") {
                            const parsed = new URL(url);
                            const username = parsed.username || "none";
                            const address = parsed.hostname || "none";
                            const port = parsed.port || "none";
                            const params = new URLSearchParams(parsed.search);
                            const network = params.get("type") || "unknown";
                            const security = params.get("security") || "none";
                            const host = params.get("host") || "none";
                            const path = decodeURIComponent(params.get("path") || "/");
                            const insecure = params.get("allowInsecure") == "1" ? "true" : "false";

                            outputText += `• Address: ${address}\n• Port: ${port}\n• UUID: ${username}\n• Network: ${network}\n• Security: ${security}\n• Host: ${host}\n• Path: ${path}\n• Allow Insecure: ${insecure}\n\n🔗 \`Open Config URL:\`\n\`${url}\`\n\n`;
                        } else if (type === "VMESS") {
                            // VMESS decoding
                            const buff = Buffer.from(url.replace("vmess://",""), 'base64');
                            const obj = JSON.parse(buff.toString());
                            outputText += `• Address: ${obj.add || "none"}\n• Port: ${obj.port || "none"}\n• ID: ${obj.id || "none"}\n• Network: ${obj.net || "none"}\n• Type: ${obj.type || "none"}\n• Host: ${obj.host || "none"}\n• Path: ${obj.path || "/"}\n\n🔗 \`Open Config URL:\`\n\`${url}\`\n\n`;
                        }
                    } catch (err) {
                        outputText += "⚠️ Could not parse this config.\n\n";
                    }
                }
            }
        }

        if (!foundAny) outputText = "❌ No valid config found in the file.";

        ctx.reply(outputText, { parse_mode: "Markdown" });

    } catch (err) {
        console.log(err);
        ctx.reply("❌ Error parsing file.");
    }
});

// ------------------ LAUNCH BOT ------------------ //
bot.launch();
console.log("Pro VPN Parser Bot running...");
