const retardData = require('../retardData');
const whitelist = require('../whitelist');

module.exports = {
    name: 'trialjsonedit',
    execute(message, args, client) {
        console.log('messaged recieved');
        if (!whitelist.includes(message.author.id)) {
            return message.reply('not whitelisted');
        }
        console.log('whitelistcheck passed');
        if (args.length < 3) {
            return message.reply('usage: `!zachbot trialjsonedit <@user OR displayName> <field> <value>`');
        }

        const getUserIdFromInput = require('../utils/getUserIdFromInput');
        const userId = getUserIdFromInput(args[0]);
        const field = args[1];
        const value = args.slice(2).join(' ');

        if (!userId) {
            return message.reply('no user found with that mention or display name.');
        }

        if (!retardData.has(userId)) {
            return message.reply(`user is not registered in the trial.`);
        }

        const playerData = retardData.get(userId);
        playerData[field] = value;
        retardData.set(userId, playerData);

        message.reply(`updated <@${userId}>'s **${field}** to: \`${value}\``);
    }
};
