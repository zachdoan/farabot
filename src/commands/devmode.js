const guildchannels = require('../guildchannels');

module.exports = {
    name: 'devmode',
    async execute(message, args, client) {
       
        guildchannels.state.flag = !guildchannels.state.flag;

   
        guildchannels.updateId();


        message.channel.send(`devmode is now ${guildchannels.state.flag}`);
        console.log(guildchannels.state.id);
    },
};
