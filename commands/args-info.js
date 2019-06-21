module.exports = {
    name: 'args-info',
    description: 'Debugging function for printing given args',
    execute(message, args) {
        if(!args.length)
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`)

        message.channel.send(`Arguments: ${args}`);
    },
};