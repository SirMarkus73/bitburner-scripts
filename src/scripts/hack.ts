import type { NS } from "@ns"

// Hacks the server where this script is running.
export async function main(ns: NS): Promise<void> {
  let currentMoney = ns.getServerMoneyAvailable()
  const maxMoney = ns.getServerMaxMoney()

  const threads = ns.args[0]

  if (typeof threads !== "number" || threads < 1) {
    throw new Error(`Invalid number of threads: ${threads}`)
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    while (currentMoney < maxMoney) {
      await ns.grow(undefined, { threads })
      currentMoney = ns.getServerMoneyAvailable()
    }

    await ns.hack(undefined, { threads })
    currentMoney = ns.getServerMoneyAvailable()
  }
}
