import type { NS } from "@ns"

// Hacks the server where this script is running.
export async function main(ns: NS): Promise<void> {
  const hostname = (ns.args[0] as string) || ns.getHostname()

  let currentMoney = ns.getServerMoneyAvailable(hostname)
  const maxMoney = ns.getServerMaxMoney(hostname)
  const minSecurity = ns.getServerMinSecurityLevel(hostname)
  let currentSecurity = ns.getServerSecurityLevel(hostname)

  const ensureMinSecurity = async () => {
    while (currentSecurity > minSecurity) {
      await ns.weaken(hostname)
      currentSecurity = ns.getServerSecurityLevel(hostname)
    }
  }

  const ensureMaxMoney = async () => {
    while (currentMoney < maxMoney) {
      await ns.grow(hostname)
      currentMoney = ns.getServerMoneyAvailable(hostname)
    }
  }

  const hackServer = async () => {
    await ns.hack(hostname)
    currentMoney = ns.getServerMoneyAvailable(hostname)
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await ensureMinSecurity()
    await ensureMaxMoney()

    await ensureMinSecurity()
    await hackServer()
  }
}
