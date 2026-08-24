import type { NS } from "@ns"

export function getNetwork(ns: NS, baseHostname = "home"): string[] {
  const visited: Set<string> = new Set()
  const queue: string[] = [baseHostname]

  while (queue.length > 0) {
    const currentHostname = queue.shift()!

    if (!visited.has(currentHostname)) {
      visited.add(currentHostname)
      const neighbors = ns.scan(currentHostname)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      }
    }
  }

  return Array.from(visited)
}
