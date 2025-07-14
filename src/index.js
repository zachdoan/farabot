const fs = require('fs');
const path = require('path');
const {
    Client,
    GatewayIntentBits,
    Collection,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    Events
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();
const retardData = require('./retardData');
const prefix = '!zachbot';
const whitelist = require('./whitelist');
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

let consoleChannel;

require('dotenv').config();

const token = process.env.DISCORD_TOKEN;

//  Load all commands

client.once('ready', async () => {
    console.log('✅ Bot is online!');
    consoleChannel = await client.channels.fetch('1392463655571947612').catch(() => null);
});


client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    if (consoleChannel) {
        consoleChannel.send(` Command received: ${commandName} ${args.join(' ')}`);
    }

    try {
        command.execute(message, args, client);
    } catch (error) {
        console.error(' Command Error:', error);
        message.reply('There was an error executing that command.');
    }
});

//  Handle interactions (buttons + modals)
client.on('interactionCreate', async interaction => {
    try {
        //  Button: Show modal to register
        if (interaction.isButton() && interaction.customId === 'register_player') {
            const modal = new ModalBuilder()
                .setCustomId('player_register_modal')
                .setTitle('Trial Registration');

            const displayNameInput = new TextInputBuilder()
                .setCustomId('display_name')
                .setLabel("Your DISPLAY name:")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const positionInput = new TextInputBuilder()
                .setCustomId('position')
                .setLabel("Your Position (e.g. setter, middle)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(displayNameInput),
                new ActionRowBuilder().addComponents(positionInput)
            );

            await interaction.showModal(modal);
        }

        //  Modal: Handle registration submission
        else if (interaction.isModalSubmit() && interaction.customId === 'player_register_modal') {
            const displayName = interaction.fields.getTextInputValue('display_name');
            const position = interaction.fields.getTextInputValue('position').toLowerCase();
            const validPositions = ['setter', 'opposite', 'middle', 'libero', 'outside', 'ds'];

            if (retardData.has(interaction.user.id)) {
                return interaction.reply({
                    content: ' You are already registered.',
                    ephemeral: true
                });
            }

            if (!validPositions.includes(position)) {
                return interaction.reply({
                    content: ` Invalid position. Valid options: ${validPositions.join(', ')}`,
                    ephemeral: true
                });
            }

            retardData.set(interaction.user.id, {
                displayName,
                position,
                discordTag: interaction.user.tag,
                tier: '',
                team: 'Unassigned',
            });

            if (consoleChannel) {
                consoleChannel.send(` Registered: ${displayName} (${position})`);
            }

            await interaction.reply({
                content: ` Registered!\n**Display Name:** ${displayName}\n**Position:** ${position}`,
                ephemeral: true
            });
        }

    } catch (error) {
        console.error(' Interaction Error:', error);

        if (interaction.replied || interaction.deferred) {
            interaction.followUp({ content: '️ Something went wrong.', ephemeral: true }).catch(() => {});
        } else {
            interaction.reply({ content: '️ Something went wrong.', ephemeral: true }).catch(() => {});
        }
    }
});
client.on('disconnect', (event) => {
    console.warn('Disconnected from Discord:', event);
    consoleChannel.send('disocnnected')
});

client.on('reconnecting', () => {
    console.log('Reconnecting to Discord API');
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});



client.login(token);