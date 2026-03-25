const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const express = require("express");

// 🔑 TOKEN YAHAN DAL
const BOT_TOKEN = "8788084813:AAFGmu-TTusoP4vBf0JGhAtM5nfVJJuihOo";

const bot = new Telegraf(BOT_TOKEN);

// 🌐 EXPRESS (Render fix)
const app = express();
app.get("/", (req, res) => res.send("Bot Running ✅"));
app.listen(process.env.PORT || 3000);

// 🚀 START
bot.start((ctx) => {
    ctx.reply(
`🔐 VPN Config Parser PRO

Send any config file (.txt)

Supports:
• Dark Tunnel / HC / EHI
• VLESS / VMESS / TROJAN`,
        Markup.inlineKeyboard([
            [Markup.button.callback("📖 Help", "help")]
        ])
    );
});

// 📖 HELP
bot.action("help", (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("Bas file bhej — bot auto extract karega 😎");
});

// 📂 FILE HANDLER
bot.on("document", async (ctx) => {
    try {
        const file = ctx.message.document;
        const link = await ctx.telegram.getFileLink(file.file_id);
        const res = await axios.get(link.href);

        let content = res.data.toString();

        // 🔥 JSON PARSE TRY
        let json = null;
        try {
            json = JSON.parse(content);
        } catch {
            const m = content.match(/{[\s\S]*}/);
            if (m) {
                try { json = JSON.parse(m[0]); } catch {}
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

        // 🔥 LOCKED CONFIG (Dark / HC / EHI)
        if (json) {
            const ssh = find(json, "SshConfig") || find(json, "sshConfig");
            const inject = find(json, "InjectConfig") || find(json, "injectConfig");

            if (ssh) {
                const host = find(ssh, "Host") || find(ssh, "EncryptedHost");
                const port = find(ssh, "Port") || find(ssh, "EncryptedPort");
                const user = find(ssh, "Username") || find(ssh, "EncryptedUsername");
                const pass = find(ssh, "Password") || find(ssh, "EncryptedPassword");

                let payload = find(inject, "Payload") || find(inject, "EncryptedPayload") || "N/A";

                payload = payload.replace(/\[crlf\]/g, "\n").replace(/\[lf\]/g, "\n");

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

        // 🔥 BASE64 DECODE TRY
        try {
            const decoded = Buffer.from(content.trim(), "base64").toString("utf-8");
            if (decoded.includes("vmess://") || decoded.includes("vless://")) {
                content = decoded;
            }
        } catch {}

        // 🔥 VLESS PARSER
        const vlessLinks = content.match(/vless:\/\/[^\s'"]+/g);

        if (vlessLinks) {
            let result = "";

            for (let link of vlessLinks) {
                try {
                    const u = new URL(link);
                    const p = new URLSearchParams(u.search);

                    result += 
`{
  "address": "${u.hostname}",
  "port": ${u.port},
  "users": [
    {
      "encryption": "none",
      "id": "${u.username}",
      "level": 8
    }
  ],
  "streamSettings": {
    "network": "${p.get("type") || "ws"}",
    "security": "${p.get("security") || "none"}",
    "wsSettings": {
      "headers": {
        "Host": "${p.get("host") || ""}"
      },
      "path": "${decodeURIComponent(p.get("path") || "/")}"
    }
  },
  "tag": "VLESS"
}

`;
                } catch {}
            }

            if (result) {
                return ctx.reply(
`✅ VLESS Extract:
━━━━━━━━━━━━━━━━━━━━
\`\`\`json
${result}
\`\`\`
━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
                    { parse_mode: "Markdown" }
                );
            }
        }

        // 🔥 VMESS PARSER
        const vmessLinks = content.match(/vmess:\/\/[^\s'"]+/g);

        if (vmessLinks) {
            let result = "";

            for (let link of vmessLinks) {
                try {
                    const base64 = link.replace("vmess://", "");
                    const j = JSON.parse(Buffer.from(base64, "base64").toString());

                    result += 
`{
  "address": "${j.add}",
  "port": ${j.port},
  "users": [
    {
      "encryption": "auto",
      "id": "${j.id}",
      "level": 8
    }
  ],
  "streamSettings": {
    "network": "${j.net}",
    "security": "${j.tls || "none"}",
    "wsSettings": {
      "headers": {
        "Host": "${j.host || ""}"
      },
      "path": "${j.path || "/"}"
    }
  },
  "tag": "VMESS"
}

`;
                } catch {}
            }

            if (result) {
                return ctx.reply(
`✅ VMESS Extract:
━━━━━━━━━━━━━━━━━━━━
\`\`\`json
${result}
\`\`\`
━━━━━━━━━━━━━━━━━━━━
👑 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
                    { parse_mode: "Markdown" }
                );
            }
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
