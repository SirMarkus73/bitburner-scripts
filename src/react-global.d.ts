// Muy tricky pero funciona

import type ReactNamespace from "react"

declare global {
  const React: typeof ReactNamespace
}

export {}
