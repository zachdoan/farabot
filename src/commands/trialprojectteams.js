const teams = require('../teams');

module.exports = {
    name: 'trialprojectteams',
    async execute(message, args, client) {
        message.channel.send('operational');
    }
}