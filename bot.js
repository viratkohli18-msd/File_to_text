const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

// ⚠️ YAHI TOKEN DALNA
const BOT_TOKEN = "8788084813:AAFGmu-TTusoP4vBf0JGhAtM5nfVJJuihOo";

const bot = new Telegraf(BOT_TOKEN);

// 🚀 START COMMAND
bot.start((ctx) => {
    ctx.reply(
`🔐 *VPN Config Parser (PRO)*

Send me any VPN config file and I'll extract details.

✅ Supported:
• VLESS • VMESS • TROJAN • SSH
• Dark Tunnel • HTTP Custom • HTTP Injector • NetMod

Tap below 👇`,
        {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("📖 Help", "help")],
                [Markup.button.url("👑 Owner", "https://t.me/yourusername")]
            ])
        }
    );
});

// 📖 HELP
bot.action("help", (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(
`📦 *How to use:*

1. Send config file  
2. Bot auto detect karega  
3. Output mil jayega  

⚠️ Encrypted config full decode nahi hota`,
        { parse_mode: "Markdown" }
    );
});

// 📂 FILE HANDLER
bot.on('document', async (ctx) => {
    try {
        const file = ctx.message.document;
        const fileLink = await ctx.telegram.getFileLink(file.file_id);
        const res = await axios.get(fileLink.href);

        let content = res.data.toString();
        let text = "";

        let json = null;
        try { json = JSON.parse(content); } catch {}

        const findKey = (obj, key) => {
            if (!obj || typeof obj !== "object") return null;
            if (obj[key]) return obj[key];
            for (let k in obj) {
                const found = findKey(obj[k], key);
                if (found) return found;
            }
            return null;
        };

        // 🔥 LOCKED CONFIG
        if (json) {
            const ssh = findKey(json, "SshConfig") || findKey(json, "sshConfig");
            const inject = findKey(json, "InjectConfig") || findKey(json, "injectConfig");

            if (ssh) {
                const host = findKey(ssh, "Host") || findKey(ssh, "EncryptedHost");
                const port = findKey(ssh, "Port") || findKey(ssh, "EncryptedPort");
                const user = findKey(ssh, "Username") || findKey(ssh, "EncryptedUsername");
                const pass = findKey(ssh, "Password") || findKey(ssh, "EncryptedPassword");

                let payload = findKey(inject, "Payload") || findKey(inject, "EncryptedPayload") || "N/A";

                payload = payload
                    .replace(/\[crlf\]/g, "\n")
                    .replace(/\[lf\]/g, "\n");

                text =
`⚠️ *SSH (LOCKED CONFIG)*

• Address: ${host || "N/A"}
• Port: ${port || "N/A"}
• Username: ${user || "N/A"}
• Password: ${pass || "N/A"}

⚠️ *Payload:*
${payload}

🔒 *Note:* Fully encrypted config

━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`;

                return ctx.reply(text, { parse_mode: "Markdown" });
            }
        }

        // 🔥 NORMAL CONFIG
        const regex = /(vless:\/\/|vmess:\/\/|trojan:\/\/|ssh:\/\/)[^\s'"]+/g;
        const match = content.match(regex);

        if (match) {
            return ctx.reply(
`✅ *Extracted Config:*
━━━━━━━━━━━━━━━━━━━━

\`${match.join("\n\n")}\`

━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
                { parse_mode: "Markdown" }
            );
        }

        ctx.reply(
`❌ No valid config found.

━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`
        );

    } catch (err) {
        console.log(err);
        ctx.reply("❌ Error processing file.");
    }
});

// 🚀 RUN
bot.launch();
console.log("🤖 Bot Running...");
