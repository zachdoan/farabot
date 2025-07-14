const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const teams = require('../teams');
const trialMeta = require('../trialMeta');
const whitelist = require('../whitelist');
const guildChannels = require('../guildchannels.js')
module.exports = {
    name: 'trialinitiate',
    async execute(message, args, client) {
        if (!whitelist.includes(message.author.id)) {
            return message.reply('not whitelisted');
        }
        
        guildChannels.updateId();

        let categoryId = guildChannels.state.id

        if (args.length === 0) {
            return message.reply('  provide at least one team name. eg:\n`!zachbot trialinitiate Team1 Team2 Team3`');
        }

   
        teams.length = 0; // clear previous
        args.forEach(name => teams.push(name));

        const channel = await message.guild.channels.create({
            name: 'trial-registration',
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: [
                // Everyone can see
                {
                    id: message.guild.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                    deny: [PermissionFlagsBits.SendMessages]
                },
            ]
        });

        trialMeta.createdTextChannels.push(channel.id);
        const registerButton = new ButtonBuilder()
            .setCustomId('register_player')
            .setLabel('📝 Register for Trial')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(registerButton);

        const embed = new EmbedBuilder()
            .setColor(0x992d22)
            .setTitle('📢 Volleyball Trial Registration')
            .setDescription(
                `Welcome to the official trials!\n\nClick the button below to begin your registration.\n\nYou'll be asked for:\n- Your **in-game display name**\n- Your **position** (e.g., outside, libero, etc.)\n\nOnce registered, you'll be eligible to be placed into teams:\n**${args.join(', ')}**`
            )
            .setFooter({ text: 'ZACHBOT FARA v1.2', iconURL: client.user.displayAvatarURL() });
        

        await channel.send({
            embeds: [embed],
            components: [row],
        });

        // Send the warning message as a separate plain message
        await channel.send(
            '## ⚠️ Please input the display name of the account that you are playing with or you will not get tiered. If you are aware that you put the wrong display name and do not inform staff before the matches start, you will not be tiered for that trial. Please be considerate of the staff since there are 20+ players to evaluate as well as the early build of the bot that cannot handle invalid inputs. Thank you! ⚠️'
        );
    }
};