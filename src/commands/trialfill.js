const retardData = require('../retardData');
const whitelist = require('../whitelist');

const positions = ['outside', 'libero', 'setter', 'opposite', 'middle'];
const tiers = ['0', '1', '2', '3', '4', '5'];

module.exports = {
    name: 'trialfill',
    async execute(message, args, client) {
        if (!whitelist.includes(message.author.id)) {
            return message.reply('not whitelisted.');
        }

        retardData.clear(); // clear existing

        for (let i = 1; i <= 60; i++) {
            const userId = `99999999999999999${i}`; // fake ID
            const displayName = `Player${i}`;
            const position = positions[Math.floor(Math.random() * positions.length)];
            const tier = tiers[Math.floor(Math.random() * tiers.length)];

            retardData.set(userId, {
                userId,
                displayName,
                position,
                tier,
                team: 'Unassigned',
            });
        }

        message.reply('done');
    }
};
