import type { AutocompleteData, NS } from "@ns"
import { ensureValidHostname } from "./utils/ensure-valid-hostname"
import { Logger } from "./utils/logger"

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
  if (args.length === 0) {
    return data.servers
  }

  if (args.length === 1) {
    const options = data.servers.filter((server) => server.startsWith(args[0]))
    const exactMatch = options.find((server) => server === args[0])

    return exactMatch ? [] : options
  }

  return []
}

export async function main(ns: NS): Promise<void> {
  const logger = new Logger(ns)

  const hostname = ns.args[0] || ns.getHostname()

  ensureValidHostname(ns, hostname)

  const server = ns.getServer(hostname)

  if (server.hasAdminRights) {
    logger.terminal.info(
      "Already have admin rights on this server, no need to nuke it.",
    )
    return
  }

  const numPortsRequired = server.numOpenPortsRequired ?? 0

  if (numPortsRequired > 0) {
    if (!server.sshPortOpen) {
      ns.brutessh(hostname)
    } else {
      logger.terminal.error(`Cannot nuke ${hostname}: SSH port is not open.`)
      return
    }
  }

  const success = ns.nuke(hostname)

  if (success) {
    logger.terminal.info(`Successfully nuked ${hostname}`)
  } else {
    logger.terminal.error(`Failed to nuke ${hostname}`)
  }
}
