import { Command } from "types/common"
import { Message } from "discord.js"
import { PREFIX } from "utils/constants"
import Community from "adapters/community"
import { composeEmbedMessage } from "utils/discordEmbed"
import { getHeader } from "utils/common"
import { getCommandArguments } from "utils/commands"

const command: Command = {
  id: "invite_config",
  command: "config",
  brief: "Configure Invite Tracker log channel.",
  category: "Community",
  onlyAdministrator: true,
  run: async function config(msg: Message) {
    const args = getCommandArguments(msg)
    if (args.length < 3) {
      return {
        messageOptions: {
          content: `${getHeader("Missing target channel", msg.author)}`,
        },
      }
    }

    const logChannel = args[2].replace(/<#|>/g, "")
    await Community.configureInvites({
      guild_id: msg.guild.id,
      log_channel: logChannel,
    })

    const embedMsg = composeEmbedMessage(msg, {
      title: `Invites Config`,
    })
    embedMsg.addField(`Done`, `logs now display in <#${logChannel}> channel.`)

    return {
      messageOptions: {
        embeds: [embedMsg],
      },
    }
  },
  getHelpMessage: async (msg) => {
    const embed = composeEmbedMessage(msg, {
      usage: `${PREFIX}invite config <channel>`,
      examples: `${PREFIX}invite config #general\n${PREFIX}invite cfg #general`,
      footer: [`Type ${PREFIX}help invite <action> for a specific action!`],
    })

    return { embeds: [embed] }
  },
  canRunWithoutAction: true,
  aliases: ["cfg"],
}

export default command
