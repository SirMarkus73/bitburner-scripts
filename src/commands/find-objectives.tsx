import type { NS, Server } from "@ns"
import { getNetwork } from "/utils/get-network"

function TreeServerItem({
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
            <TreeServerItem
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

function TreeServerList({ ns }: { ns: NS }) {
  return (
    <ul>
      <TreeServerItem
        hostname="home"
        ns={ns}
        isParentExpanded
        defaultExpanded
      />
    </ul>
  )
}

const getServerList = (
  ns: NS,
  sortFn?: (a: string, b: string) => number,
  name?: string,
) => {
  return getNetwork(ns)
    .sort(sortFn)
    .filter((hostname) => !name || hostname.includes(name))
}

function ServerList({ ns }: { ns: NS }) {
  const [currentSortFn, setCurrentSortFn] =
    React.useState<(a: string, b: string) => number>()

  const [search, setSearch] = React.useState<string>("")

  const servers = getServerList(ns, currentSortFn, search)

  const sortByRequiredHackingLevel = React.useCallback(
    (a: string, b: string) => {
      const serverALevel = ns.getServerRequiredHackingLevel(a)
      const serverBLevel = ns.getServerRequiredHackingLevel(b)
      return serverALevel - serverBLevel
    },
    [ns],
  )

  const sortByRequiredPorts = React.useCallback(
    (a: string, b: string) => {
      const serverAPorts = ns.getServerNumPortsRequired(a)
      const serverBPorts = ns.getServerNumPortsRequired(b)
      return serverAPorts - serverBPorts
    },
    [ns],
  )

  const sortByAdminRights = React.useCallback(
    (a: string, b: string) => {
      const serverAAdmin = +ns.hasRootAccess(a)
      const serverBAdmin = +ns.hasRootAccess(b)
      return serverBAdmin - serverAAdmin // Sort in descending order, so servers with admin rights come first
    },
    [ns],
  )

  const sortByBackdoorInstalled = React.useCallback(
    (a: string, b: string) => {
      const serverA = ns.getServer(a).backdoorInstalled ? 1 : 0
      const serverB = ns.getServer(b).backdoorInstalled ? 1 : 0

      return serverB - serverA // Sort in descending order, so servers with admin rights come first
    },
    [ns],
  )

  return (
    <>
      <label>
        Search servers:
        <input
          placeholder="n00dles"
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <table>
        <thead>
          <th>Hostname</th>
          <th>
            <button
              type="button"
              onClick={() => setCurrentSortFn(() => sortByRequiredHackingLevel)}
            >
              Required Hacking Level
            </button>
          </th>
          <th>Max Money</th>
          <th>Min Security Level</th>
          <th>
            <button
              type="button"
              onClick={() => setCurrentSortFn(() => sortByRequiredPorts)}
            >
              Num Open Ports Required
            </button>
          </th>
          <th>
            <button
              type="button"
              onClick={() => setCurrentSortFn(() => sortByAdminRights)}
            >
              Has Admin Rights
            </button>
          </th>
          <th>
            <button
              type="button"
              onClick={() => setCurrentSortFn(() => sortByBackdoorInstalled)}
            >
              Backdoor Installed
            </button>
          </th>
          <th>Is farming money</th>
        </thead>
        <tbody>
          {servers.map((hostname) => {
            const server = ns.getServer(hostname)
            const isFarmingMoney = ns.isRunning("scripts/hack.js", hostname)

            return (
              <tr key={hostname}>
                <td>{hostname}</td>
                <td>{server.requiredHackingSkill}</td>
                <td>{server.moneyMax}</td>
                <td>{server.minDifficulty}</td>
                <td>{server.numOpenPortsRequired}</td>
                <td
                  style={{
                    background: server.hasAdminRights ? "green" : "red",
                    color: "black",
                  }}
                >
                  {server.hasAdminRights ? "Yes" : "No"}
                </td>
                <td
                  style={{
                    background: server.backdoorInstalled ? "green" : "red",
                    color: "black",
                  }}
                >
                  {server.backdoorInstalled ? "Yes" : "No"}
                </td>
                <td
                  style={{
                    background: isFarmingMoney ? "green" : "red",
                    color: "black",
                  }}
                >
                  {isFarmingMoney ? "Yes" : "No"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export async function main(ns: NS) {
  ns.ui.setTailTitle("Server List")
  ns.ui.openTail()
  ns.disableLog("ALL")

  const flags = ns.flags([["tree", false]])
  const isTreeMode = flags.tree

  ns.printRaw(isTreeMode ? <TreeServerList ns={ns} /> : <ServerList ns={ns} />)

  const running = true
  while (running) {
    await ns.asleep(1000)
  }
}
