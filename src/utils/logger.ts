import type { NS } from "@ns"

export class Logger {
  constructor(private readonly ns: NS) {
    this.ns = ns
  }

  public terminal = {
    info: (message: string) => this.ns.tprint(`INFO: ${message}`),
    warn: (message: string) => this.ns.tprint(`WARN: ${message}`),
    error: (message: string) => this.ns.tprint(`ERROR: ${message}`),
  }
}
