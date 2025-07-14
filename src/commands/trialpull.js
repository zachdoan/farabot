const retardData = require('../retardData');
const whitelist = require('../whitelist');
const getUserIdFromInput = require('../utils/getUserIdFromInput');

module.exports = {
    name: 'trialpull',
    async execute(message, args, client) {
        if (!whitelist.includes(message.author.id)) {
            return message.reply('you are not whitelisted.');
        }

        if (args.length < 1) {
            return message.reply('usage: `!zachbot trialpull <@user> or DisplayName>`');
        }

        const userId = getUserIdFromInput(args[0]);

        if (!userId || !retardData.has(userId)) {
            return message.reply('player not found in trial data.');
        }

        const playerData = retardData.get(userId);

        const fields = Object.entries(playerData).map(
            ([key, value]) => `**${key}**: \`${value || 'None'}\``
        ).join('\n');

        message.reply({
            content: ` Trial data for <@${userId}>:\n${fields}`,
            allowedMentions: { users: [] }
        });
    }
};
