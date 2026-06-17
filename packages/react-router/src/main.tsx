import type { CanAccess, Navo, NavoNode, NavoNodeInput } from '@navo/core'
import { createContext, useContext, useMemo, useState } from 'react'
import {
  type BaseRouteObject,
  Navigate,
  type NonIndexRouteObject,
  type RouteObject,
  useLocation,
} from 'react-router'

export type NavNodeEscapeHatch = Omit<BaseRouteObject, 'id' | 'path'>

declare module '@navo/core' {
  interface NavoNodeInput {
    route?: NavNodeEscapeHatch
  }
}

/** 内置的自动重定向到真实页面 */
function NavoRedirect({ navNode }: { navNode?: NavoNode | null }) {
  const navo = useContext(NavoContext)
  const location = useLocation()

  const resolveNode = navNode ? navo?.authedIdMap.get(navNode.id) : null
  if (resolveNode) return <Navigate to={resolveNode.path} replace />
  if (navo && location.pathname === navo.originNavo.basePath)
    return <Navigate to={navo.authedRootResolvePath} replace />
}

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

/** 生成react router routes */
export function generateRoutes<T extends NavoNodeInput[]>(navo: Navo<T>): RouteObject[] {
  const navNodes = navo.nodes
  const r = (navNodes: NavoNode[]) => {
    const routes: RouteObject[] = []
    for (let i = 0; i < navNodes.length; i++) {
      const navNode = navNodes[i]
      const route: NonIndexRouteObject = {
        ...navNode.route,
        id: navNode.id,
        path: navNode.originPath,
      }
      if (navNode.children?.length) {
        route.children = r(navNode.children)
      }
      routes.push(route)
    }

    if (navNodes.length) {
      routes.push({
        index: true,
        element: <NavoRedirect navNode={navNodes[0].parent} />,
      })
    }
    return routes
  }

  return r(navNodes)
}
