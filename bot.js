const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// 🔑 👉 YAHAN TOKEN PASTE KAR
const bot = new Telegraf("8788084813:AAFGmu-TTusoP4vBf0JGhAtM5nfVJJuihOo");

// ------------------ START UI ------------------ //
bot.start((ctx) => {
    ctx.reply(
`🔐 *VPN Config Parser*

Send me any VPN config file and I'll extract the connection details.

✅ Supported outputs:
vless:// • vmess:// • trojan:// • ssh://

📦 Supported input formats:
• V2Ray / Xray
• HTTP Custom
• Dark Tunnel
• AuraNet / HA Tunnel / SlowDNS

Tap Help below 👇`,
        {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("📖 Help", "help"), Markup.button.callback("ℹ️ About", "about")],
                [Markup.button.callback("🛡 Credits", "credits")]
            ])
        }
    );
});

// ------------------ BUTTONS ------------------ //
bot.action("help", (ctx) => {
    ctx.editMessageText(
`📖 *Help*

बस file send karo 📁  
Bot automatically detect karke extract karega.

Supported:
• .json • .txt • .conf • any VPN file

No rename needed 😎`,
        { parse_mode: "Markdown" }
    );
});

bot.action("about", (ctx) => {
    ctx.editMessageText(
`ℹ️ *About*

This bot extracts configs:
VLESS / VMESS / Trojan / SSH

⚡ Fast • Clean • Accurate`,
        { parse_mode: "Markdown" }
    );
});

bot.action("credits", (ctx) => {
    ctx.editMessageText(
`☠︎ *Credits*

𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
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

        const regexes = {
            VLESS: /vless:\/\/[^\s'"]+/g,
            VMESS: /vmess:\/\/[^\s'"]+/g,
            TROJAN: /trojan:\/\/[^\s'"]+/g,
            SSH: /ssh:\/\/[^\s'"]+/g
        };

        let text = "✅ *Extracted Config:*\n━━━━━━━━━━━━━━━━━━━━\n\n";
        let found = false;

        for (let type in regexes) {
            const matches = content.match(regexes[type]);
            if (matches) {
                found = true;

                for (let url of matches) {
                    text += `⚠️ *${type}*\n\n`;

                    try {
                        if (type === "VLESS" || type === "TROJAN" || type === "SSH") {
                            const u = new URL(url);
                            const params = new URLSearchParams(u.search);

                            text += 
`• Address: ${u.hostname}
• Port: ${u.port}
• UUID: ${u.username}
• Network: ${params.get("type") || "unknown"}
• Security: ${params.get("security") || "none"}
• Host: ${params.get("host") || "none"}
• Path: ${decodeURIComponent(params.get("path") || "/")}
• Allow Insecure: ${params.get("allowInsecure") == "1" ? "true" : "false"}

🔗 Open Config URL:
\`${url}\`

`;
                        }

                        else if (type === "VMESS") {
                            const decoded = JSON.parse(
                                Buffer.from(url.replace("vmess://",""), 'base64').toString()
                            );

                            text += 
`• Address: ${decoded.add}
• Port: ${decoded.port}
• ID: ${decoded.id}
• Network: ${decoded.net}
• Type: ${decoded.type}
• Host: ${decoded.host}
• Path: ${decoded.path}

🔗 Open Config URL:
\`${url}\`

`;
                        }

                    } catch {
                        text += "⚠️ Parse error\n\n";
                    }
                }
            }
        }

        if (!found) text = "❌ No valid config found.";

        ctx.reply(text, { parse_mode: "Markdown" });

    } catch (err) {
        console.log(err);
        ctx.reply("❌ Error processing file.");
    }
});

// ------------------ RUN BOT ------------------ //
bot.launch();
console.log("🚀 PRO Bot Running..."); 
