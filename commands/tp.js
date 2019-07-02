const TeemoJS = require('teemojs');
const { riotApi } = require('../config/config.json');
const api = TeemoJS(riotApi);

const { RichEmbed } = require('discord.js');

module.exports = {
    name: 'tp',
    description: 'Third-party code test',
    
    async execute(message, args) {
        let region = '';

        switch(args[0]) {
            case 'eune':
                region = 'eun1';
            break;

            case 'na':
                region = 'na1';
            break;

            case 'euw':
                region = 'euw1';
            break;

            case 'tr':
                region = 'tr1';
            break;

            default:
                message.channel.send(`The ${args[0]} region is not supported for now!`);
                break;
        }

        //
        let bannedChamps = [];

        bannedChamps.push(
            {
                name: `Aatrox`,
                image: `http://ddragon.leagueoflegends.com/cdn/9.13.1/img/champion/Aatrox.png`,
            },
            {
                name: `Lucian`,
                image: `http://ddragon.leagueoflegends.com/cdn/9.13.1/img/champion/Lucian.png`,
            },
            {
                name: `Zed`,
                image: `http://ddragon.leagueoflegends.com/cdn/9.13.1/img/champion/Zed.png`,
            },
        );

        message.channel.send('***Banned Champions***');

        for(let champion in bannedChamps) {
            message.channel.send(new RichEmbed()
                .setTitle(bannedChamps[champion].name)
                .setImage(bannedChamps[champion].image)
            );
        }
    }
}