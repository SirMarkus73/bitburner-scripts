import type { NS } from "@ns"
import { getHackablePorts } from "/utils/get-hackeable-ports"
import { getNetwork } from "/utils/get-network"
import { Logger } from "/utils/logger"

export async function main(ns: NS): Promise<void> {
  const logger = new Logger(ns)

  const hackablePorts = getHackablePorts(ns)
  // Get all servers that can be nuked
  const network = getNetwork(ns, "home").filter((hostname) => {
    if (hostname === "home") return false // Skip home server
    if (ns.hasRootAccess(hostname)) return false // Skip servers that already have root access
    if (ns.getServerNumPortsRequired(hostname) > hackablePorts) return false // Skip servers that require more ports than we can hack

    return true
  })

  logger.terminal.info(`Found ${network.length} servers available to nuke.`)
  logger.terminal.info(`Servers found to nuke: ${network.join(", ")}`)

  const neededRam = ns.getScriptRam("commands/nuke/nuke-server.js")

  while (network.length > 0) {
    const availableRam = ns.getServerMaxRam() - ns.getServerUsedRam()
    if (availableRam < neededRam) {
      await ns.sleep(1000)
      continue
    } // Wait for RAM to be available before sending the next nuke

    const hostname = network.shift()
    if (!hostname) break

    const pid = ns.run("commands/nuke/nuke-server.js", 1, hostname)

    if (pid === 0) {
      logger.terminal.error(`Failed to start nuke script on ${hostname}`)
    } else {
      logger.terminal.info(`Started nuke script on ${hostname} with PID ${pid}`)
    }
  }
}
