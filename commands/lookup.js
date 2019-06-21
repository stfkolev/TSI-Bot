const TeemoJS = require('teemojs');
const { riotApi } = require('../config/config.json');
const api = TeemoJS(riotApi);

const { RichEmbed } = require('discord.js');

module.exports = {
    name: 'lookup',
    description: 'Looking up information for a player in League of Legends',
    cooldown: 90,
    
    execute(message, args) {
        var queue = '';

        if(!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        } else if(args.length <= 2) {
            return message.channel.send(`Please provide me region and summoner name, ${message.author}!\nYou can use this template: \`!lookup eune 3v3 Row\`` );
        }

        switch(args[1]) {
            case 'solo':
            case 'duo':
                queue = 'RANKED_SOLO_5x5';
                break;

            case '3s':
            case '3v3':
                queue = 'RANKED_FLEX_TT';
                break;

            case '5s':
            case '5v5':
                queue = 'RANKED_FLEX_SR';
                break;

            default:
                message.channel.send(`The ${args[2]} is not a queue!`);
                break;
        }

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

            default:
                message.channel.send(`The ${args[0]} region is not supported for now!`);
                break;
        }

        let summonerName = args.slice(2).join(' ');

        let summonerId = api.get(region, 'summoner.getBySummonerName', summonerName);

        summonerId.then(data => {
           // message.channel.send(`Your summoner ID is ${data.id}`)
            api.get(region, 'league.getLeagueEntriesForSummoner', data.id)
                .then(accountData => {

                    for(let index = 0; index < accountData.length; index++) {
                        if(!accountData[index]) {
                            message.channel.send(`\`I have no information about that queue, sorry!\``);
                        } else {
                            if(accountData[index].queueType == queue) {
                                console.log(accountData[index]);
    
                                let description = '';
                                let summonerRank = '';
    
                                /*! Convert Ranking for image */
                                let rank = rankNumber => {
                                    switch(rankNumber) {
                                        case 'I':
                                            return 1;
                                        case 'II':
                                            return 2;
                                        case 'III':
                                            return 3;
                                        case 'IV':
                                            return 4;
                                    }
                                };
                                
                                if(!accountData[index].tier) {
                                    accountData[index].tier = 'Unranked';
                                    accountData[index].rank = '';
                                    accountData[index].leaguePoints = '';
    
                                    description = `Currently ${accountData[index].tier}`
                                    summonerRank = `https://opgg-static.akamaized.net/images/medals/${accountData[index].tier.toLowerCase()}.png`;
                                } else {
                                    description = `Currently ${accountData[index].tier} ${accountData[index].rank} on ${accountData[index].leaguePoints} points`;
                                    summonerRank = `https://opgg-static.akamaized.net/images/medals/${accountData[index].tier.toLowerCase()}_${rank(accountData[index].rank)}.png`;
                                }
    
                                /*! Create panel for summoner info */
                                let summonerInfo = new RichEmbed()
    
                                .setColor('#0099ff')
                                .setTitle(`Summoner info about ${data.name}`)
                                
                                .setAuthor(data.name, 'http://ddragon.leagueoflegends.com/cdn/9.12.1/img/profileicon/'+ data.profileIconId +'.png')
                                .setDescription(description)
                                .setThumbnail('http://ddragon.leagueoflegends.com/cdn/9.12.1/img/profileicon/'+ data.profileIconId +'.png')
    
                                .addBlankField()
    
                                .addField('Summoner Name ', data.name, true)
                                .addField('Division ', accountData[index].tier + ' ' + accountData[index].rank + ' ~ ' + accountData[index].leaguePoints + ' LP' ,true)
                                .setImage(summonerRank)
    
                                .addBlankField()
    
                                .addField('Veteran ', accountData[index].veteran ? 'Yes' : 'No', true)
                                .addField('Inactive ', accountData[index].inactive ? 'Yes' : 'No', true)
                                .addField('Hot Streak ', accountData[index].hotStreak ? 'Yes' : 'No', true)
                                .addField('Fresh Blood ', accountData[index].freshBlood ? 'Yes' : 'No', true)
    
                                .addBlankField()
    
                                .addField('Wins ', accountData[index].wins, true)
                                .addField('Losses ', accountData[index].losses, true)
    
                                .setTimestamp()
                                .setFooter('Generated by The Shadow Isles Bot');
    
                                message.channel.send(summonerInfo);
                            }
                        }
                    }
                });
        });
    }
}