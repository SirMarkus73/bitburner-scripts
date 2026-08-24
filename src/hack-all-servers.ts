import type { NS } from "@ns"
import { ensureValidHostname } from "./utils/ensure-valid-hostname"

export async function main(ns: NS): Promise<void> {
  const baseHostname = ns.args[0] || "home"

  ensureValidHostname(ns, baseHostname)

  const childServers = ns
    .scan(baseHostname)
    .filter((host) => host !== baseHostname)

  for (const childServer of childServers) {
    if (!ns.getServer(childServer).hasAdminRights) {
      continue
    }

    ns.run("hack-server.js", 1, childServer)
    ns.run("hack-all-servers.js", 1, childServer)
  }
}
