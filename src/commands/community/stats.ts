import { Command } from "types/common"
import { PREFIX } from "utils/constants"
import {
  MessageSelectOptionData,
  SelectMenuInteraction,
  Message,
} from "discord.js"
import { CommandChoiceHandler } from "utils/CommandChoiceManager"
import {
  composeDiscordSelectionRow,
  composeDiscordExitButton,
  composeEmbedMessage,
} from "utils/discordEmbed"
import Community from "adapters/community"

const countType: Array<string> = [
  "members",
  "channels",
  "stickers",
  "emojis",
  "roles",
]

const statsSelectionHandler: CommandChoiceHandler = async (
  msgOrInteraction
) => {
  const interaction = msgOrInteraction as SelectMenuInteraction
  const { message } = <{ message: Message }>interaction
  const input = interaction.values[0]
  const id = input.split("_")[0]
  return await renderStatEmbed(message, id, interaction)
}

const countStatsHandler: CommandChoiceHandler = async (msgOrInteraction) => {
  const interaction = msgOrInteraction as SelectMenuInteraction
  const { message } = <{ message: Message }>interaction
  const input = interaction.values[0]
  const [type, stat] = input.split("_")
  const countTypeReq = type + "_" + stat
  await Community.createStatChannel(message.guildId, countTypeReq)
  const successEmbeded = composeEmbedMessage(message, {
    title: `Server Stats\n\n`,
    description: `Successfully count ` + type + ` ` + stat,
  })
  return {
    messageOptions: {
      embeds: [successEmbeded],
      components: [],
    },
    commandChoiceOptions: {
      interaction,
    },
  }
}

async function renderStatEmbed(
  msg: Message,
  statId: string,
  interaction: SelectMenuInteraction
) {
  let statType = ""
  switch (statId) {
    case "members":
      statType = " all, user, bot"
      break
    case "channels":
      statType = " all, text, voice, stage, category, announcement"
      break
    case "emojis":
      statType = " all, static, animated"
      break
    case "stickers":
      statType = " all, standard, guild"
      break
    case "roles":
      statType = " all"
      break
    default:
      statType = ""
      break
  }
  const statTypeReplace = statType.replaceAll(" ", "")
  const statTypeList: Array<string> = statTypeReplace.split(",")

  const opt = (statType: unknown): MessageSelectOptionData => ({
    label: `${statType}`,
    value: `${statType}_${statId}`,
  })
  const selectRow = composeDiscordSelectionRow({
    customId: "tickers_type_selection",
    placeholder: "Select type",
    options: statTypeList.map((c) => opt(c)),
  })

  msg.content = statId
  return {
    messageOptions: {
      embeds: [
        composeEmbedMessage(msg, {
          title: `Server Stats`,
          description: `Please select what type you want to show`,
        }),
      ],
      components: [selectRow, composeDiscordExitButton()],
    },
    commandChoiceOptions: {
      userId: msg.author.id,
      guildId: msg.guildId,
      channelId: msg.channelId,
      handler: countStatsHandler,
      interaction,
    },
  }
}
const command: Command = {
  id: "stats",
  command: "stats",
  brief: "Server Stats",
  category: "Community",
  onlyAdministrator: true,
  run: async function (msg) {
    const opt = (countType: unknown): MessageSelectOptionData => ({
      label: `${countType}`,
      value: `${countType}`,
    })

    const selectRow = composeDiscordSelectionRow({
      customId: "tickers_stat_selection",
      placeholder: "Select stat",
      options: countType.map((c) => opt(c)),
    })

    return {
      messageOptions: {
        embeds: [
          composeEmbedMessage(msg, {
            title: `Server Stats`,
            description: `Please select what stat you want to show`,
          }),
        ],
        components: [selectRow, composeDiscordExitButton()],
      },
      commandChoiceOptions: {
        userId: msg.author.id,
        guildId: msg.guildId,
        channelId: msg.channelId,
        handler: statsSelectionHandler,
      },
    }
  },
  getHelpMessage: async (msg) => {
    const embed = composeEmbedMessage(msg, {
      usage: `${PREFIX}stats`,
      footer: [`Type ${PREFIX}help stats`],
      examples: `${PREFIX}stats`,
    })

    return { embeds: [embed] }
  },
}

export default command
