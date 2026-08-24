import type { NS } from "@ns"
import { ensureValidHostname } from "utils/ensure-valid-hostname"

async function scanAndNukeChildServers(
  ns: NS,
  hostname: string,
): Promise<void> {
  const childServers = ns.scan(hostname).filter((host) => host !== hostname)

  for (const childServer of childServers) {
    if (ns.getServer(childServer).hasAdminRights) {
      continue
    }

    // Prevent stack overflow by waiting for the nuke script to finish before recursing
    ns.run("commands/nuke/nuke-server.js", 1, childServer)
    while (ns.scriptRunning("commands/nuke/nuke-server.js", childServer)) {
      await ns.sleep(100)
    }

    ns.run("commands/nuke/nuke-all-servers.js", 1, childServer)
  }
}

export async function main(ns: NS): Promise<void> {
  const baseHostname = ns.args[0] || "home"

  ensureValidHostname(ns, baseHostname)

  await scanAndNukeChildServers(ns, baseHostname)
}
