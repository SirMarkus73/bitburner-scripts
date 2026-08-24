import type { NS } from "@ns"

// Hacks the server where this script is running.
export async function main(ns: NS): Promise<void> {
  let currentMoney = ns.getServerMoneyAvailable()
  const maxMoney = ns.getServerMaxMoney()
  const minSecurity = ns.getServerMinSecurityLevel()
  let currentSecurity = ns.getServerSecurityLevel()

  const threads = ns.args[0]

  if (typeof threads !== "number" || threads < 1) {
    throw new Error(`Invalid number of threads: ${threads}`)
  }

  const ensureMinSecurity = async () => {
    while (currentSecurity > minSecurity) {
      await ns.weaken(undefined, { threads })
      currentSecurity = ns.getServerSecurityLevel()
    }
  }

  const ensureMaxMoney = async () => {
    while (currentMoney < maxMoney) {
      await ns.grow(undefined, { threads })
      currentMoney = ns.getServerMoneyAvailable()
    }
  }

  const hackServer = async () => {
    await ns.hack(undefined, { threads })
    currentMoney = ns.getServerMoneyAvailable()
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await ensureMinSecurity()
    await ensureMaxMoney()

    await ensureMinSecurity()
    await hackServer()
  }
}
