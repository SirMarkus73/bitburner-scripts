import type { AutocompleteData, NS } from "@ns"
import { ensureValidHostname } from "utils/ensure-valid-hostname"
import { getMaxThreads } from "utils/getMaxThreads"
import { Logger } from "utils/logger"

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

  const maxMoney = server.moneyMax || 0
  const canRunScripts = server.maxRam !== 0

  if (maxMoney === 0) {
    logger.terminal.warn(`Server ${hostname} cannot be hacked (max money is 0)`)
    return
  }

  if (!canRunScripts) {
    if (ns.isRunning("scripts/hack.js", "home", hostname)) {
      logger.terminal.warn(
        `Hack script is already running on home server for ${hostname}`,
      )
      return
    }

    logger.terminal.warn(
      `Server ${hostname} cannot run scripts (max RAM is 0), using home server instead`,
    )
    const threads = Math.max(
      Math.floor(getMaxThreads(ns, "scripts/hack.js", "home") / 3),
      1,
    )

    const pid = ns.exec(`scripts/hack.js`, "home", { threads }, hostname)

    if (pid === 0) {
      logger.terminal.error(`Failed to start hack script on ${hostname}`)
    }

    logger.terminal.info(
      `Started hack script on ${hostname} with PID ${pid} on home server`,
    )
    return
  }

  if (ns.isRunning("scripts/hack.js", hostname)) {
    logger.terminal.warn(`Hack script is already running on ${hostname}`)
    return
  }

  ns.scp("scripts/hack.js", hostname)
  const threads = getMaxThreads(ns, "scripts/hack.js", hostname)

  if (threads < 1) {
    logger.terminal.error(`Not enough RAM on ${hostname} to run hack script`)
    return
  }

  const pid = ns.exec(`scripts/hack.js`, hostname, { threads })

  if (pid === 0) {
    logger.terminal.error(`Failed to start hack script on ${hostname}`)
  }

  logger.terminal.info(`Started hack script on ${hostname} with PID ${pid}`)
}
