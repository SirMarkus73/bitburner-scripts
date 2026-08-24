import type { NS } from "@ns"

export function getHackablePorts(ns: NS): number {
  const programNames = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe",
  ]

  return programNames.reduce((count, programName) => {
    if (ns.fileExists(programName, "home")) {
      return count + 1
    }
    return count
  }, 0)
}
