import type { NS } from "@ns"
import { ensureValidHostname } from "./utils/ensure-valid-hostname"

async function scanAndNukeChildServers(
  ns: NS,
  hostname: string,
): Promise<void> {
  const childServers = ns.scan(hostname).filter((host) => host !== hostname)

  for (const childServer of childServers) {
    if (ns.getServer(childServer).hasAdminRights) {
      continue
    }

    ns.run("nuke-server.js", 1, childServer)
    while (ns.scriptRunning("nuke-server.js", childServer)) {
      await ns.sleep(100)
    }

    ns.run("nuke-all-servers.js", 1, childServer)
  }
}

export async function main(ns: NS): Promise<void> {
  const baseHostname = ns.args[0] || "home"

  ensureValidHostname(ns, baseHostname)

  await scanAndNukeChildServers(ns, baseHostname)
}
