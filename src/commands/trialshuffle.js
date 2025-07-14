const { ChannelType, PermissionFlagsBits } = require('discord.js');
const retardData = require('../retardData');
const teams = require('../teams');
const trialMeta = require('../trialMeta');
const whitelist = require('../whitelist');
const guildChannels = require('../guildchannels.js')
module.exports = {
    name: 'trialshuffle',
   async execute(message, args, client) {
       if (!whitelist.includes(message.author.id)) {
           return message.reply('not whitelisted');
       }

       guildChannels.updateId();
       let categoryId = guildChannels.state.id;

       // Add verification for category
       try {
           const category = await message.guild.channels.fetch(categoryId);
           if (!category || category.type !== ChannelType.GuildCategory) {
               return message.channel.send(`Error: Invalid category ID (${categoryId}). Please check the configuration.`);
           }
       } catch (error) {
           console.error('Category fetch error:', error);
           return message.channel.send(`Error: Could not find category with ID ${categoryId}. Please check the configuration.`);
       }

       // Rest of your code...

        const positions = {
            setter: [],
            opposite: [],
            middle: [],
            libero: [],
            outside: []
        };

        for (const [userId, data] of retardData.entries()) {
            const pos = data.position.toLowerCase();
            if (positions[pos]) {
                positions[pos].push({ userId, ...data });
            }
        }

    
        const required = {
            setter: 1,
            opposite: 1,
            middle: 1,
            libero: 1,
            outside: 2
        };

        let maxTeams = Infinity;
        for (const role in required) {
            const possible = Math.floor(positions[role].length / required[role]);
            maxTeams = Math.min(maxTeams, possible);
        }

        if (maxTeams < 2) {
            return message.channel.send('not enough players to form a complete team.');
        }

    
        for (const role in positions) {
            positions[role].sort(() => Math.random() - 0.5);
        }


       const createdTeams = [];

       for (let i = 0; i < maxTeams; i++) {
           const teamName = teams[i] || `Team${i + 1}`; // fallback just in case
           const team = {
               name: teamName,
               players: []
           };;

            for (const role in required) {
                for (let j = 0; j < required[role]; j++) {
                    const player = positions[role].shift();
                    if (player) {
                        player.team = team.name;
                        retardData.set(player.userId, player);
                        team.players.push(player);
                    }
                }
            }

            createdTeams.push(team);
        }

       
        const unassigned = [];
        for (const role in positions) {
            unassigned.push(...positions[role]);
        }

        unassigned.forEach(player => {
            player.team = 'Unassigned';
            retardData.set(player.userId, player);
        });

  
        teams.length = 0; // Clear existing teams
        for (const t of createdTeams) {
            teams.push(t.name);
        }

       for (const channelId of trialMeta.createdVCs) {
           const channel = await message.guild.channels.fetch(channelId).catch(() => null);
           if (channel) {
               await channel.delete().catch(() => null);
           }
       }

       // When creating voice channels, add more error handling
       for (const team of createdTeams) {
           try {
               const vcChannel = await message.guild.channels.create({
                   name: `${team.name}-vc`,
                   type: ChannelType.GuildVoice,
                   parent: categoryId,
                   permissionOverwrites: [
                       {
                           id: message.guild.id,
                           allow: [PermissionFlagsBits.ViewChannel],
                       },
                       ...team.players.map(player => ({
                           id: String(player.userId),
                           allow: [PermissionFlagsBits.Connect],
                       })),
                   ],
               });
               trialMeta.createdVCs.push(vcChannel.id);
           } catch (error) {
               console.error(`Failed to create channel for ${team.name}:`, error);
               message.channel.send(`Failed to create voice channel for ${team.name}: ${error.message}`).catch(() => {});
           }
       }
        message.channel.send(` Successfully created ${createdTeams.length} team(s). Unassigned players: ${unassigned.length}`);
    }
};