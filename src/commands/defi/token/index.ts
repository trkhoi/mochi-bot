import { Command } from "types/common"
import { getEmoji, getHeader, thumbnails } from "utils/common"
import Defi from "adapters/defi"
import { composeEmbedMessage } from "utils/discordEmbed"
import { PREFIX } from "utils/constants"
import add from "./add"
import remove from "./remove"
import list from "./list"
import { getAllAliases } from "utils/commands"

const actions: Record<string, Command> = {
  list,
  add,
  remove
}
const commands: Record<string, Command> = getAllAliases(actions)

const command: Command = {
  id: "tokens",
  command: "tokens",
  brief: "Show all supported tokens by Mochi",
  category: "Defi",
  run: async function(msg, action) {
    const actionObj = commands[action]
    if (actionObj) {
      return actionObj.run(msg)
    }
    const supportedTokens = await Defi.getSupportedTokens()
    const description = supportedTokens
      .map(token => {
        const tokenEmoji = getEmoji(token.symbol)
        return `${tokenEmoji} **${token.symbol.toUpperCase()}**`
      })
      .join("\n")

    return {
      messageOptions: {
        embeds: [
          composeEmbedMessage(msg, {
            author: ["All supported tokens"],
            description
          })
        ],
        content: getHeader("View all supported tokens by Mochi", msg.author)
      }
    }
  },
  getHelpMessage: async (msg, action) => {
    const actionObj = commands[action]
    if (actionObj) {
      return actionObj.getHelpMessage(msg)
    }
    return {
      embeds: [
        composeEmbedMessage(msg, {
          thumbnail: thumbnails.TOKENS,
          usage: `${PREFIX}tokens`
        })
      ]
    }
  },
  canRunWithoutAction: true,
  aliases: ["token", "tkn", "tk"],
  actions
}

export default command
