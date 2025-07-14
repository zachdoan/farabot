const retardData = require('../retardData');
const whitelist = require('../whitelist');

const tierRoles = {
    '0': '1390570009687756930',
    '1': '1373292108026482841',
    '2': '1373292107527098429',
    '3': '1373292036299554869',
    '4': '1373291982931099799',
    '5': '1373291931597279302',
};

module.exports = {
    name: 'trialtier',
    async execute(message, args, client) {
        if (!whitelist.includes(message.author.id)) {
            return message.reply('not whitelisted');
        }
        await message.channel.send('processing data, DO NOT RUN ANY COMMANDS DURING THIS TIME');
        const guild = message.guild;
        const tierIds = Object.values(tierRoles);
        const updatedPlayers = [];
        const consoleChannel = await client.channels.fetch('1392463655571947612');
        let output = '#Tier Updattes \n'
        for (const [userId, data] of retardData.entries()) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (!member) continue;
                                                                                    
            const newTier = parseInt(data.tier);
            const newRoleId = tierRoles[data.tier];
            if (!newRoleId) continue;

            // Determine member's current tier (highest they hold)
            const currentTier = Object.entries(tierRoles).reduce((highest, [tier, roleId]) => {
                
                if (member.roles.cache.has(roleId)) {
                    const tierNum = parseInt(tier);
                    return tierNum > highest ? tierNum : highest;
                }
                return highest;
            }, -1);

            // Only promote or same-tier reapply
            console.log(newTier, currentTier);
            if (newTier <= currentTier) {
                await member.roles.remove(tierIds).catch(() => null);
                await member.roles.add(newRoleId).catch(() => null);
                updatedPlayers.push(`<@${userId}> --> Tier ${newTier}`);
                output += `<@${userId}> --> Tier ${newTier} \n`
            }
         
            if (currentTier === -1){
                console.log(`${data.displayName} does not have a tier role adding ${newTier}`)
                await member.roles.add(newRoleId).catch(() => null);
                updatedPlayers.push(`<@${userId}> DID NOT HAVE TIER ROLE--> Tier ${newTier}`);
                output += `<@${userId}> DID NOT HAVE TIER ROLE--> Tier ${newTier} \n`
            }
            
        }
        const chunks = [];
        let chunk = '';

        for (const line of output.split('\n')){
            if (chunk.length + line.length > 2000) {
                chunks.push(chunk)
                chunk = ''
            }
            chunk += line + '\n'
        }
        if (chunk.length > 0) chunks.push(chunk);
        for (const chunk of chunks ) {
            if (chunk.trim().length === 0) continue;
            try {
                await message.channel.send(chunk);
                console.log(chunk);
                console.log("Message successfully sent!");
            } catch (error) {
                console.error("Failed to send message:", error);
            }

        }
    }
};