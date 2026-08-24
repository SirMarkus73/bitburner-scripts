import type { NS, Server } from "@ns"

function ServerItem({
  hostname,
  ns,
  isParentExpanded,
  parentHostname,
  defaultExpanded = false,
}: {
  parentHostname?: string
  hostname: string
  ns: NS
  isParentExpanded: boolean
  defaultExpanded?: boolean
}) {
  const server = ns.getServer(hostname)
  const [childServers, setChildServers] = React.useState<Server[]>([])
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  React.useEffect(() => {
    if (isParentExpanded && childServers.length === 0) {
      const childServers = ns
        .scan(hostname)
        .filter((host) => host !== parentHostname)
        .map(ns.getServer)

      setChildServers(childServers)
    }
  }, [server, isParentExpanded, ns])

  const backgroundColor =
    (server.hasAdminRights && server.backdoorInstalled) ||
    server.hostname === "home"
      ? "green"
      : server.hasAdminRights
        ? "yellow"
        : "red"

  return (
    <li>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: backgroundColor }}
      >
        {server.hostname}
        <div style={{ background: "lightgray", fontSize: "0.8rem" }}>
          {server.hasAdminRights
            ? "🔓"
            : `Ports: ${server.openPortCount} / ${server.numOpenPortsRequired}\nHacking ${server.requiredHackingSkill}lvl`}
          {server.backdoorInstalled
            ? "| 🚪"
            : `lvl ${ns.getHackingLevel()} / ${server.requiredHackingSkill}`}
        </div>
      </button>
      {isExpanded && (
        <ul>
          {childServers.map((childServer) => (
            <ServerItem
              key={childServer.hostname}
              hostname={childServer.hostname}
              ns={ns}
              isParentExpanded={isExpanded}
              parentHostname={hostname}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ServerList({ ns }: { ns: NS }) {
  return (
    <ul>
      <ServerItem hostname="home" ns={ns} isParentExpanded defaultExpanded />
    </ul>
  )
}

export async function main(ns: NS) {
  ns.ui.setTailTitle("Server List")
  ns.ui.openTail()
  ns.disableLog("ALL")

  ns.printRaw(<ServerList ns={ns} />)

  const running = true
  while (running) {
    await ns.asleep(1000)
  }
}
