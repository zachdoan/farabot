const retardData = require('../retardData');
const whitelist = require('../whitelist');

module.exports = {
    name: 'masstier',
    async execute(message, args, client) {
        if (!whitelist.includes(message.author.id)) {
            return message.reply('you are not whitelisted.');
        }

        if (args.length < 2) {
            return message.reply('usage: `!zachbotrole masstier name1,name2,name3 tierNumber`');
        }

        const inputNames = args[0].split(',').map(n => n.trim().toLowerCase());
        const tier = args[1];

        if (!['0','1','2','3','4','5'].includes(tier)) {
            return message.reply('invalid tier. Use a number from 0 to 5.');
        }

        const updated = [];
        const notFound = [];

        for (const inputName of inputNames) {
            let found = false;
            for (const [userId, data] of retardData.entries()) {
                if (data.displayName.toLowerCase().includes(inputName)) {
                    data.tier = tier;
                    retardData.set(userId, data);
                    updated.push(` ${data.displayName} -> Tier ${tier}`);
                    found = true;
                    break;
                }
            }
            if (!found) notFound.push(`X ${inputName}`);
        }

        let reply = '';
        if (updated.length > 0) {
            reply += `**Updated:**\n${updated.join('\n')}\n`;
        }
        if (notFound.length > 0) {
            reply += `\n**Not Found:**\n${notFound.join('\n')}`;
        }

        message.reply(reply || 'No valid names provided.');
    }
};