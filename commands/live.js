const TeemoJS = require('teemojs');
const { riotApi } = require('../config/config.json');
const api = TeemoJS(riotApi);

const { RichEmbed } = require('discord.js');

module.exports = {
    name: 'live',
    description: 'Live match information',
    
    execute(message, args) {
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

        console.log(args);
        let summonerName = args.slice(1).join(' ');

        let liveGame = api.get(region, 'spectator.getCurrentGameInfoBySummoner', summonerName);

        liveGame.then(data => {
            console.log(data);
        });
    }
}