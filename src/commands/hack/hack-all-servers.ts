import type { NS } from "@ns"
import { getNetwork } from "/utils/get-network"
import { Logger } from "/utils/logger"

export async function main(ns: NS): Promise<void> {
  const logger = new Logger(ns)

  const network = getNetwork(ns).filter((hostname) => {
    if (hostname === "home") return false // Skip home server.
    if (!ns.hasRootAccess(hostname)) return false // Skip servers that does not have root access.
    if (ns.getServerMaxMoney(hostname) === 0) return false // Skip servers that cannot have money.

    return true
  })

  logger.terminal.info(`Found ${network.length} servers available to hack.`)

  const neededRam = ns.getScriptRam("commands/hack/hack-server.js")
  while (network.length > 0) {
    const availableRam = ns.getServerMaxRam() - ns.getServerUsedRam()
    if (availableRam < neededRam) {
      await ns.sleep(1000)
      continue
    } // Wait for RAM to be available before sending the next hack

    const hostname = network.shift()
    if (!hostname) break

    const pid = ns.run("commands/hack/hack-server.js", 1, hostname)

    if (pid === 0) {
      logger.terminal.error(`Failed to start hack script on ${hostname}`)
    } else {
      logger.terminal.info(`Started hack script on ${hostname} with PID ${pid}`)
    }
  }
}
