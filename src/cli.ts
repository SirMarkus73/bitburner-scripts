import type { AutocompleteData, NS, ScriptArg } from "@ns"

type AutoCompleteOption = string[] | "SERVER"

type getCommandReturn = {
  filename: string | null
  args?: ScriptArg[]
  nextAutocomplete: AutoCompleteOption
}

function getCommand(args: ScriptArg[]): getCommandReturn {
  switch (args[0]) {
    case "find-objectives": {
      return {
        filename: "commands/find-objectives.js",
        args: [args[1] === "tree" ? "--tree" : ""],
        nextAutocomplete: ["tree"],
      }
    }
    case "nuke": {
      return {
        filename: "commands/nuke/nuke-server.js",
        nextAutocomplete: "SERVER",
        args: [args[1]],
      }
    }
    case "hack": {
      return {
        filename: "commands/hack/hack-server.js",
        nextAutocomplete: "SERVER",
        args: [args[1]],
      }
    }

    case "recurse": {
      switch (args?.[1]) {
        case "nuke": {
          return {
            filename: "commands/nuke/nuke-all-servers.js",
            nextAutocomplete: [],
          }
        }

        case "hack": {
          return {
            filename: "commands/hack/hack-all-servers.js",
            nextAutocomplete: [],
          }
        }

        default: {
          return {
            filename: null,
            nextAutocomplete: ["nuke", "hack"],
          }
        }
      }
    }

    default: {
      return {
        filename: null,
        nextAutocomplete: ["find-objectives", "nuke", "hack", "recurse"],
      }
    }
  }
}

export function autocomplete(
  data: AutocompleteData,
  args: ScriptArg[],
): string[] {
  const { nextAutocomplete } = getCommand(args)

  if (typeof nextAutocomplete === "string") {
    if (nextAutocomplete === "SERVER") {
      return data.servers
    }
  }

  return nextAutocomplete
}

export function main(ns: NS): void {
  const { filename, nextAutocomplete, args = [] } = getCommand(ns.args)

  if (!filename) {
    if (nextAutocomplete.length === 0) {
      ns.tprint("Invalid command. No further options available.")
      return
    }

    if (typeof nextAutocomplete === "string" && nextAutocomplete === "SERVER") {
      ns.tprint("Invalid command. Please provide a server name.")
      return
    }

    ns.tprint(
      `Invalid command. Available options: ${nextAutocomplete.join(", ")}`,
    )
    return
  }

  const pid = ns.run(filename, 1, ...args)

  ns.tprint(
    `Started ${filename} with PID ${pid}. Arguments: ${args.join(", ")}`,
  )
}
