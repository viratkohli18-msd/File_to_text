const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

// 🔑 TOKEN YAHAN DAL
const BOT_TOKEN = "8788084813:AAFGmu-TTusoP4vBf0JGhAtM5nfVJJuihOo";

const bot = new Telegraf(BOT_TOKEN);

// 🚀 START
bot.start((ctx) => {
    ctx.reply(
`🔐 VPN Config Parser (PRO)

Send any config file (.txt / .json)

Supports:
• Dark Tunnel / HTTP Custom / HTTP Injector / NetMod
• VLESS • VMESS • TROJAN • SSH`,
        Markup.inlineKeyboard([
            [Markup.button.callback("📖 Help", "help")]
        ])
    );
});

// 📖 HELP
bot.action("help", (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("बस file bhej — bot khud detect karega 😎");
});

// 📂 FILE HANDLER
bot.on("document", async (ctx) => {
    try {
        const file = ctx.message.document;
        const link = await ctx.telegram.getFileLink(file.file_id);
        const res = await axios.get(link.href);

        let content = res.data.toString();

        // 🔥 STEP 1: JSON FORCE PARSE
        let json = null;
        try {
            json = JSON.parse(content);
        } catch {
            const match = content.match(/{[\s\S]*}/);
            if (match) {
                try { json = JSON.parse(match[0]); } catch {}
            }
        }

        // 🔎 DEEP SEARCH
        const find = (obj, key) => {
            if (!obj || typeof obj !== "object") return null;
            if (obj[key]) return obj[key];
            for (let k in obj) {
                const f = find(obj[k], key);
                if (f) return f;
            }
            return null;
        };

        // 🔥 LOCKED CONFIG EXTRACT
        if (json) {
            const ssh = find(json, "SshConfig") || find(json, "sshConfig");
            const inject = find(json, "InjectConfig") || find(json, "injectConfig");

            if (ssh) {
                const host = find(ssh, "Host") || find(ssh, "EncryptedHost");
                const port = find(ssh, "Port") || find(ssh, "EncryptedPort");
                const user = find(ssh, "Username") || find(ssh, "EncryptedUsername");
                const pass = find(ssh, "Password") || find(ssh, "EncryptedPassword");

                let payload = find(inject, "Payload") || find(inject, "EncryptedPayload") || "N/A";

                payload = payload
                    .replace(/\[crlf\]/g, "\n")
                    .replace(/\[lf\]/g, "\n");

                return ctx.reply(
`⚠️ SSH (LOCKED CONFIG)

• Host: ${host || "N/A"}
• Port: ${port || "N/A"}
• Username: ${user || "N/A"}
• Password: ${pass || "N/A"}

⚠️ Payload:
${payload}

🔒 Note: Fully encrypted config

━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`
                );
            }
        }

        // 🔥 STEP 2: LINK EXTRACT
        const regex = /(vless:\/\/|vmess:\/\/|trojan:\/\/|ssh:\/\/)[^\s'"]+/g;
        const links = content.match(regex);

        if (links) {
            return ctx.reply(
`✅ Extracted Config:
━━━━━━━━━━━━━━━━━━━━

${links.join("\n\n")}

━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`
            );
        }

        // ❌ FINAL
        ctx.reply(
`❌ No valid config found

━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`
        );

    } catch (e) {
        console.log(e);
        ctx.reply("❌ Error processing file");
    }
});

// 🚀 RUN
bot.launch();
console.log("Bot running...");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🌐 Server running on port " + PORT);
});
