import type { CanAccess, Navo, NavoNode, NavoNodeInput } from '@navojs/core'
import { createContext, useMemo, useState } from 'react'

export interface NavoContextProps {
  originNavo: Navo<NavoNodeInput[]>
  nodes: NavoNode[]
  idMap: Map<string, NavoNode>
  authedNodes: NavoNode[]
  authedIdMap: Map<string, NavoNode>
  authedRootResolvePath: string
  onCanAccess: (node: CanAccess) => void
}

export const NavoContext = createContext<NavoContextProps | null>(null)

export type NavoProviderProps<T extends NavoNodeInput[]> = {
  navo: Navo<T>
  children?: React.ReactNode
}

/** Navo Provider */
export function NavoProvider<T extends NavoNodeInput[]>({ children, navo }: NavoProviderProps<T>) {
  const [state, setState] = useState({
    nodes: navo.nodes,
    idMap: navo.idMap,
    authedNodes: navo.authedNodes,
    authedIdMap: navo.authedIdMap,
    authedRootResolvePath: navo.authedRootResolvePath,
  })

  const value = useMemo(
    () => ({
      ...state,
      originNavo: navo,
      onCanAccess: (canAccess?: CanAccess) => {
        navo.authenticat(canAccess)
        setState({
          nodes: navo.nodes,
          idMap: navo.idMap,
          authedNodes: navo.authedNodes,
          authedIdMap: navo.authedIdMap,
          authedRootResolvePath: navo.authedRootResolvePath,
        })
      },
    }),
    [navo, state]
  )

  return <NavoContext.Provider value={value}>{children}</NavoContext.Provider>
}
