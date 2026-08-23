import type { NS } from "@ns"

export function ensureValidHostname(
  ns: NS,
  hostname: unknown,
): asserts hostname is string {
  if (typeof hostname !== "string") {
    throw new Error(`Invalid hostname: ${hostname}`)
  }

  if (!ns.serverExists(hostname)) {
    throw new Error(`Server does not exist: ${hostname}`)
  }
}
