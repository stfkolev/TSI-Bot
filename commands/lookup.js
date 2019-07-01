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
        let queueId = null;

        if(!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        } else if(args.length <= 2) {
            return message.channel.send(`Please provide me region and summoner name, ${message.author}!\nYou can use this template: \`!lookup eune 3v3 Row\`` );
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
    
                case 'tr':
                    region = 'tr1';
                break;
    
                case 'kr':
                    region = 'kr';
                    break;
    
                case 'jp':
                    region = 'jp1';
                    break;
    
                case 'oce':
                    region = 'oc1';
                    break;
    
                case 'ru':
                    region = 'ru';
                    break;
    
                case 'br':
                    region = 'br1';
                    break;
    
                case 'lan':
                    region = 'la1';
                    break;
    
                case 'las':
                    region = 'la2';
                    break;

            default:
                message.channel.send(`The ${args[0]} region is not supported for now!`);
                break;
        }

        switch(args[1]) {
            case 'solo':
            case 'duo':
                queue = 'RANKED_SOLO_5x5';
                queueId = 420;
                break;

            case '3s':
            case '3v3':
                queue = 'RANKED_FLEX_TT';
                queueId = 470;
                break;

            case '5s':
            case '5v5':
                queue = 'RANKED_FLEX_SR';
                queueId = 440;
                break;

            default:
                message.channel.send(`The ${args[2]} is not a queue!`);
                break;
        }
        
        let summonerName = args.slice(2).join(' ');

        let summonerId = api.get(region, 'summoner.getBySummonerName', summonerName);

        summonerId.then(data => {
           // message.channel.send(`Your summoner ID is ${data.id}`)
            api.get(region, 'league.getLeagueEntriesForSummoner', data.id)
                .then(accountData => {

                    let found = false;
                    let hasSeries = true;

                    for(let index = 0; index < accountData.length; index++) {
                        if(accountData[index].queueType == queue)
                            found = true;
                    }

                    if(!found) {
                        message.channel.send(`\`I have no information about that queue, sorry!\``);

                        return;
                        
                    } else {    
                        for(let index = 0; index < accountData.length; index++) {
                            
                            if(accountData[index].queueType == queue) {
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

                                let division = divisionId => {
                                    switch(divisionId) {
                                        
                                        case 'IRON':
                                            return 0;

                                        case 'BRONZE':
                                            return 0.4;

                                        case 'SILVER':
                                            return 0.8;

                                        case 'GOLD':
                                            return 1.2;

                                        case 'PLATINUM':
                                            return 1.6;

                                        case 'DIAMOND':
                                            return 2;

                                        case 'MASTER':
                                        case 'GRANDMASTER':
                                        case 'CHALLENGER':
                                            return 2.4;

                                    }
                                }
                                
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

                                /*! MMR Variables */

                                let summonerScore = null;
                                let wonGames = 0;

                                /* END MMR Variables */

                                let matchHistory = api.get(region, 'match.getMatchlist', data.accountId);

                                matchHistory.then(async matches => {
                                   
                                    for(let match in matches.matches) {
                                        if(match < 10) {
                                            api.get(region, 'match.getMatch', matches.matches[match].gameId).then(game => {
                                                let teamId = null;
                                                let participantId = null;

                                                if(game.queueId == queueId) {

                                                    for(let participant in game.participantIdentities)
                                                        if(game.participantIdentities[participant].player.accountId == data.accountId)
                                                            participantId = game.participantIdentities[participant].participantId;

                                                    for(let participant in game.participants)
                                                        if(game.participants[participant].participantId == participantId)
                                                            teamId = game.participants[participant].teamId;

                                                    for(let team in game.teams)
                                                        if(game.teams[team].teamId == teamId && game.teams[team].win == 'Win')
                                                            wonGames += 1;

                                                    console.log(wonGames);
                                                }
                                            });
                                        }
                                    }

                                    summonerScore = await parseInt((division(accountData[index].tier) * 1000) + (rank(accountData[index].rank) * 100) +  (wonGames * 10) + (accountData[index].wins / (accountData[index].wins + accountData[index].losses) * 100));
                                    /*! Create panel for summoner info */
                                    let summonerInfo =  await new RichEmbed()

                                    .setColor('#0099ff')
                                    .setTitle(`Summoner info about ${data.name}`)
                                    
                                    .setAuthor(data.name, 'http://ddragon.leagueoflegends.com/cdn/9.13.1/img/profileicon/'+ data.profileIconId +'.png')
                                    .setDescription(description)
                                    .setThumbnail('http://ddragon.leagueoflegends.com/cdn/9.13.1/img/profileicon/'+ data.profileIconId +'.png')

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
                                    .addField('Winrate ', (accountData[index].wins / (accountData[index].wins + accountData[index].losses) * 100).toFixed(2) + '%', true)
                                    .addField('Estimated MMR ', summonerScore, true)

                                    .setTimestamp()
                                    .setFooter('Generated by The Shadow Isles Bot');

                                    await message.channel.send(summonerInfo);
                                });
                            }
                        }
                    }
                });
        });
    }
}