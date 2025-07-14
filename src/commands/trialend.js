const retardData = require('../retardData');
const teams = require('../teams');
const trialMeta = require('../trialMeta');
const whitelist = require('../whitelist');

module.exports = {
    name: 'trialend',
    async execute(message, args, client) {
  
        if (!whitelist.includes(message.author.id)) {
            return message.reply('not whitelisted');
        }


        const consoleChannel = await client.channels.fetch('1392463655571947612');
        if (retardData.size === 0) {
            await consoleChannel.send(' no players were registered this trial.');
        } else {
            let output = ` **Final Trial Summary:**\n\n`;
            const grouped = {};

            for (const teamName of teams) {
                grouped[teamName] = [];
            }
            grouped['Unassigned'] = [];

            for (const [userId, data] of retardData.entries()) {
                if (teams.includes(data.team)) {
                    grouped[data.team].push({ userId, ...data });
                } else {
                    grouped['Unassigned'].push({ userId, ...data });
                }
            }

            for (const teamName of [...teams, 'Unassigned']) {
                const players = grouped[teamName];
                if (players.length === 0) continue;

                output += `\n**${teamName.toUpperCase()}**\n`;
                let index = 1;
                for (const player of players) {
                    output += `${index}. **${player.displayName}** — *${player.position}* (discord: <@${player.userId}>) tier: ${player.tier || 'Unranked'}\n`;
                    index++;
                }
            }

         
            const chunks = [];
            let chunk = '';

            for (const line of output.split('\n')) {
                if (chunk.length + line.length + 1 > 2000) {
                    chunks.push(chunk);
                    chunk = '';
                }
                chunk += line + '\n';
            }
            if (chunk.length > 0) chunks.push(chunk);

         
            for (const part of chunks) {
                if (part.trim().length === 0) continue; // avoid empty messages
                await consoleChannel.send(part);
            }
        }

       
        for (const channelId of trialMeta.createdVCs) {
            try {
                const channel = await client.channels.fetch(channelId);
                if (channel) await channel.delete('Trial ended');
            } catch (err) {
                console.error(`Failed to delete VC ${channelId}:`, err.message);
            }
        }
        const vcLength = trialMeta.createdVCs.length;
        const textLength = trialMeta.createdTextChannels.length;

   
        for (const channelId of trialMeta.createdTextChannels) {
            try {
                const channel = await client.channels.fetch(channelId);
                if (channel) await channel.delete('Trial ended');
            } catch (err) {
                console.error(`Failed to delete text channel ${channelId}:`, err.message);
            }
        }

        //c;lear player and teams
        retardData.clear();
        teams.length = 0;
        trialMeta.createdVCs = [];
        trialMeta.createdTextChannels = [];

       
        message.channel.send(`Trial cleanup complete.\n
VCs deleted: ${vcLength}\n
Text channels deleted: ${textLength}`);
    }
};