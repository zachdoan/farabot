const retardData = require('../retardData');
const whitelist = require('../whitelist');
const teams = require('../teams');

const tierRoles = {
    '0': '1390570009687756930',
    '1': '1373292108026482841',
    '2': '1373292107527098429',
    '3': '1373292036299554869',
    '4': '1373291982931099799',
    '5': '1373291931597279302',
};

module.exports = {
    name: 'trialcurrent',
    async execute(message, args, client) {
        if (!whitelist.includes(message.author.id)) {
            return message.reply('you are not whitelisted. contact Zach.');
        }

        if (retardData.size === 0) {
            return message.reply('no players have registered yet.');
        }

        const groupedTeams = {};
        for (const teamName of teams) {
            groupedTeams[teamName] = [];
        }
        groupedTeams['Unassigned'] = [];

        for (const [userId, data] of retardData.entries()) {
            if (data.team && teams.includes(data.team)) {
                groupedTeams[data.team].push({ userId, ...data });
            } else {
                groupedTeams['Unassigned'].push({ userId, ...data });
            }
        }

        let output = '# Current Registered Players\n';

        for (const teamName of [...teams, 'Unassigned']) {
            const players = groupedTeams[teamName];
            if (players.length === 0) continue;

            // Calculate average tier
            let totalTier = 0;
            let tieredCount = 0;

            for (const player of players) {
                const member = await message.guild.members.fetch(player.userId).catch(() => null);
                if (!member) continue;

                for (const [tierStr, roleId] of Object.entries(tierRoles)) {
                    if (member.roles.cache.has(roleId)) {
                        totalTier += parseInt(tierStr);
                        tieredCount++;
                        break;
                    }
                }
            }

            const avgTier = tieredCount > 0
                ? (totalTier / tieredCount).toFixed(2)
                : 'N/A';

            output += `\n**${teamName.toUpperCase()}** (avg tier: ${avgTier})\n`;

            let index = 1;
            for (const player of players) {
                output += `${index}. **${player.displayName}** — *${player.position}* (discord: <@${player.userId}>) tier: ${player.tier || 'Unranked'}\n`;
                index++;
            }
        }

        // Split output into chunks of 2000 characters max
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
            if (part.trim().length === 0) continue;
            await message.channel.send(part);
        }
    }
};
