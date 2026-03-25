const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// 🔑 TOKEN YAHAN PASTE KAR
const bot = new Telegraf("8788084813:AAFGmu-TTusoP4vBf0JGhAtM5nfVJJuihOo");

// ------------------ UI ------------------ //
bot.start((ctx) => {
    ctx.reply(
`🔐 *VPN Config Parser*

Send any VPN config file and I'll extract everything 💀

✅ Outputs:
vless:// • vmess:// • trojan:// • ssh://

📦 Supports:
Dark Tunnel • HTTP Custom • HTTP Injector • NetMod • V2Ray • SlowDNS

👇 Tap below`,
        {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("📖 Help", "help"), Markup.button.callback("ℹ️ About", "about")],
                [Markup.button.callback("🛡 Credits", "credits")]
            ])
        }
    );
});

// Buttons
bot.action("help", (ctx) => {
    ctx.editMessageText("📖 Send any VPN file (.txt/.json/.conf). Auto decode hoga 😎", { parse_mode: "Markdown" });
});

bot.action("about", (ctx) => {
    ctx.editMessageText("⚡ Advanced VPN Config Extractor Bot", { parse_mode: "Markdown" });
});

bot.action("credits", (ctx) => {
    ctx.editMessageText("☠︎ 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪", { parse_mode: "Markdown" });
});

// ------------------ CORE PARSER ------------------ //
function extractConfigs(text) {
    const regex = /(vless:\/\/|vmess:\/\/|trojan:\/\/|ssh:\/\/)[^\s'"]+/g;
    return text.match(regex);
}

// 🔥 Multi decode function
function multiDecode(text) {
    let results = [text];

    // Base64 decode try
    try {
        let decoded = Buffer.from(text, 'base64').toString('utf-8');
        if (decoded.includes("vless://") || decoded.includes("vmess://")) {
            results.push(decoded);
        }
    } catch {}

    // Double base64
    try {
        let decoded2 = Buffer.from(results[results.length - 1], 'base64').toString('utf-8');
        if (decoded2.includes("vless://") || decoded2.includes("vmess://")) {
            results.push(decoded2);
        }
    } catch {}

    return results;
}

// ------------------ FILE HANDLER ------------------ //
bot.on('document', async (ctx) => {
    try {
        const file = ctx.message.document;
        const fileLink = await ctx.telegram.getFileLink(file.file_id);

        const res = await axios.get(fileLink.href);
        let content = res.data.toString();

        let decodedLayers = multiDecode(content);

        let configs = [];

        for (let layer of decodedLayers) {
            let found = extractConfigs(layer);
            if (found) configs.push(...found);
        }

        if (configs.length === 0) {
            return ctx.reply("❌ No valid config found (even after deep scan).");
        }

        let text = "✅ *Extracted Config:*\n━━━━━━━━━━━━━━━━━━━━\n\n";

        for (let url of configs) {

            if (url.startsWith("vless://")) {
                try {
                    const u = new URL(url);
                    const p = new URLSearchParams(u.search);

                    text += 
`⚠️ *VLESS*

• Address: ${u.hostname}
• Port: ${u.port}
• UUID: ${u.username}
• Network: ${p.get("type") || "unknown"}
• Security: ${p.get("security") || "none"}
• Host: ${p.get("host") || "none"}
• Path: ${decodeURIComponent(p.get("path") || "/")}

🔗 Open Config URL:
\`${url}\`

`;
                } catch {
                    text += "⚠️ VLESS parse error\n\n";
                }
            }

            else if (url.startsWith("vmess://")) {
                try {
                    const d = JSON.parse(Buffer.from(url.replace("vmess://",""), 'base64').toString());

                    text += 
`⚠️ *VMESS*

• Address: ${d.add}
• Port: ${d.port}
• ID: ${d.id}
• Network: ${d.net}
• Type: ${d.type}
• Host: ${d.host}
• Path: ${d.path}

🔗 Open Config URL:
\`${url}\`

`;
                } catch {
                    text += "⚠️ VMESS parse error\n\n";
                }
            }

            else {
                text += `⚠️ *OTHER*\n\`${url}\`\n\n`;
            }
        }

        ctx.reply(text, { parse_mode: "Markdown" });

    } catch (err) {
        console.log(err);
        ctx.reply("❌ Error processing file.");
    }
});

// ------------------ RUN ------------------ //
bot.launch();
console.log("💀 Ultimate Parser Bot Running...");
