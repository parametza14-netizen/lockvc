const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
require("dotenv").config();

// Roles ที่สามารถใช้คำสั่ง
const allowedRoles = ["หลวงปู่เค็ม"];
const bypassRoles = ["หลวงปู่เค็ม"];

// ID ของ channel สำหรับแจ้งผล
const logChannelId = "1417445694419239014"; // <-- แก้เป็น ID ของ channelที่ต้องการ

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
  if (!channel) {
    if (content === "!ล็อค" || content === "!ปลด") {
      return message.channel.send("❌ คุณต้องอยู่ในห้องเสียงก่อน");
    }
    return;
  }

  // สร้าง embed แจ้งผล
  const embed = new EmbedBuilder()
    .setTitle("🎵 การจัดการห้องเสียง")
    .setTimestamp()
    .setFooter({ text: `โดย ${member.user.tag}` });

  // ดึง channel สำหรับแจ้งผล
  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) {
    console.log("❌ ไม่พบ channel สำหรับแจ้งผล");
    return;
  }

  if (content === "!ล็อค") {
    try {
      for (const role of guild.roles.cache.values()) {
        if (bypassRoles.includes(role.name)) continue;
        // ล็อค: ยังเห็นห้องแต่เข้าไม่ได้
        await channel.permissionOverwrites.edit(role, { Connect: false, ViewChannel: true });
      }
      embed.setDescription(`🔒 ห้องเสียง **${channel.name}** ถูกล็อคแล้ว!`).setColor("Red");
      return logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.channel.send("❌ ไม่สามารถล็อคห้องได้");
    }
  }

  if (content === "!ปลด") {
    try {
      for (const role of guild.roles.cache.values()) {
        if (bypassRoles.includes(role.name)) continue;
        const overwrite = channel.permissionOverwrites.cache.get(role.id);
        if (overwrite) await overwrite.delete(); // คืนค่า default → เห็นและเข้าได้
      }
      embed.setDescription(`🔓 ห้องเสียง **${channel.name}** ถูกปลดล็อคแล้ว!`).setColor("Green");
      return logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.channel.send("❌ ไม่สามารถปลดล็อคห้องได้");
    }
  }
});

client.login(process.env.TOKEN);
