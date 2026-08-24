import type { NS } from "@ns"

async function upgradeNodesToLevel(ns: NS, level: number) {
  const hacknetNodes = Array.from(
    { length: ns.hacknet.numNodes() },
    (_, i) => i,
  )

  while (hacknetNodes.length > 0) {
    for (const nodeIndex of hacknetNodes) {
      const currentLevel = ns.hacknet.getNodeStats(nodeIndex).level
      if (currentLevel < level) {
        ns.hacknet.upgradeLevel(nodeIndex, 1)
      } else {
        hacknetNodes.splice(hacknetNodes.indexOf(nodeIndex), 1)
      }

      await ns.sleep(100)
    }
  }
}

async function upgradeNodesToRam(ns: NS, ram: number) {
  const hacknetNodes = Array.from(
    { length: ns.hacknet.numNodes() },
    (_, i) => i,
  )

  while (hacknetNodes.length > 0) {
    for (const nodeIndex of hacknetNodes) {
      const currentRam = ns.hacknet.getNodeStats(nodeIndex).ram
      if (currentRam < ram) {
        ns.hacknet.upgradeRam(nodeIndex, 1)
      } else {
        hacknetNodes.splice(hacknetNodes.indexOf(nodeIndex), 1)
      }

      await ns.sleep(100)
    }
  }
}

async function upgradeNodesToCores(ns: NS, cores: number) {
  const hacknetNodes = Array.from(
    { length: ns.hacknet.numNodes() },
    (_, i) => i,
  )

  while (hacknetNodes.length > 0) {
    for (const nodeIndex of hacknetNodes) {
      const currentCores = ns.hacknet.getNodeStats(nodeIndex).cores
      if (currentCores < cores) {
        ns.hacknet.upgradeCore(nodeIndex, 1)
      } else {
        hacknetNodes.splice(hacknetNodes.indexOf(nodeIndex), 1)
      }
      
      await ns.sleep(100)
    }
  }
}

export async function main(ns: NS) {
  const flags = ns.flags([
    ["level", 0],
    ["RAM", 0],
    ["cores", 0],
  ])

  if (typeof flags.level === "number" && flags.level > 0) {
    await upgradeNodesToLevel(ns, flags.level)
  }

  if (typeof flags.RAM === "number" && flags.RAM > 0) {
    await upgradeNodesToRam(ns, flags.RAM)
  }

  if (typeof flags.cores === "number" && flags.cores > 0) {
    await upgradeNodesToCores(ns, flags.cores)
  }
}
