const { prefix } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')
const RegexFun = require('../functions/regex')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const errorCard = require('../templates/errorCard')
const { getCards } = require('../functions/commands')


const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerStats = await Player.getStats(playerId)
    const playerDatas = await Player.getDatas(playerId)

    const options = []

    playerStats.segments.forEach(e => options.push({
      label: `${e.label} ${e.mode}`,
      value: JSON.stringify({
        map: e.label,
        mode: e.mode,
        steamId: steamId,
        userId: message.author.id
      })
    }))

    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('mapSelector')
          .setPlaceholder('No maps selected')
          .addOptions(options),
      )

    return {
      content: `Select one of the following maps to get the stats related (${playerDatas.nickname})`,
      components: [row]
    }

  } catch (error) {
    console.log(error)
    return errorCard('**No players found**')
  }
}

module.exports = {
  name: 'map',
  aliasses: ['map'],
  options: [
    {
      name: 'user_steam_id',
      description: 'Steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'user_custom_steam_id',
      description: 'Custom steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'steam_profile_link',
      description: 'Url of a steam profile.',
      required: false,
      type: 3
    },
    {
      name: 'csgo_status',
      description: 'The result of the "status" command in CS:GO that contains the user part.',
      required: false,
      type: 3
    },
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6
    }
  ],
  description: "Displays your stats of the map given, or the stats of the user tagged. (only 1 user by command)",
  usage: 'one of the options',
  type: 'command',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)

    if (message.mentions.users.size > 0) return getCards(message, [message.mentions.users.first()], sendCardWithInfos, 1)
    else if (steamIds.length > 0) return getCards(message, [steamIds[0]], sendCardWithInfos)
    else if (args.length > 0) return getCards(message, [args[0].split('/').filter(e => e).pop()], sendCardWithInfos)
    else if (await User.get(message.author.id)) return getCards(message, [message.author], sendCardWithInfos, 1)
    else return errorCard(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`)
  }
}