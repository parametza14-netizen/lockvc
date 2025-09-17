const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.login(process.env.DISCORD_TOKEN);

const { Client, GatewayIntentBits, Partials } = require("discord.js");
require("dotenv").config();

const allowedRoles = ["หลวงปู่เค็ม"]; // role ที่สามารถใช้คำสั่ง
const bypassRoles = ["หลวงปู่เค็ม"];  // role ที่ยังเข้าห้องได้

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const { member, guild } = message;
  const content = message.content.trim();

  // เช็ก role ใช้คำสั่ง
  if (!member.roles.cache.some(r => allowedRoles.includes(r.name))) return;

  const channel = member.voice.channel;
  if (!channel) return message.reply("❌ คุณต้องอยู่ในห้องเสียงก่อน");

  if (content === "!ล็อค") {
    try {
      for (const role of guild.roles.cache.values()) {
        if (bypassRoles.includes(role.name)) continue;
        // แค่ล็อคไม่ให้เข้าห้อง แต่ยังเห็นห้อง
        await channel.permissionOverwrites.edit(role, {
          Connect: false
        });
      }
      return message.reply(`🔒 ห้องเสียง **${channel.name}** ถูกล็อคแล้ว!`);
    } catch (err) {
      console.error("⚠️ เกิดข้อผิดพลาดตอนล็อค:", err);
      return message.reply("❌ ไม่สามารถล็อคห้องได้");
    }
  }

  if (content === "!ปลด") {
    try {
      for (const role of guild.roles.cache.values()) {
        if (bypassRoles.includes(role.name)) continue;
        const overwrite = channel.permissionOverwrites.cache.get(role.id);
        if (overwrite) await overwrite.delete(); // คืนค่า default
      }
      return message.reply(`🔓 ห้องเสียง **${channel.name}** ถูกปลดล็อคแล้ว!`);
    } catch (err) {
      console.error("⚠️ เกิดข้อผิดพลาดตอนปลดล็อค:", err);
      return message.reply("❌ ไม่สามารถปลดล็อคห้องได้");
    }
  }
});

client.login(process.env.TOKEN);
