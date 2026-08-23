import type { NS } from "@ns"

export function getMaxThreads(
  ns: NS,
  script: string,
  hostname: string,
  scriptHostname: string = hostname,
): number {
  const maxThreads = Math.floor(
    (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) /
      ns.getScriptRam(script, scriptHostname),
  )
  return maxThreads
}
