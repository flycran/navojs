import type { CanAccess, Navo, NavoNode, NavoNodeInput } from '@navo/core'
import { type InjectionKey, inject, provide, reactive, type VNode } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export type NavRouteEscapeHatch = Omit<RouteRecordRaw, 'path' | 'name' | 'children'>

declare module '@navo/core' {
  interface NavoNodeInput {
    route?: NavRouteEscapeHatch
  }
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

export const NavoKey: InjectionKey<NavoContextProps> = Symbol('Navo')

export type NavoProviderProps<T extends NavoNodeInput[]> = {
  navo: Navo<T>
}

/** Navo Provider */
export function NavoProvider<T extends NavoNodeInput[]>(
  props: NavoProviderProps<T>,
  { slots }: { slots: { default?: () => VNode[] } }
) {
  const state = reactive({
    nodes: props.navo.nodes,
    idMap: props.navo.idMap,
    authedNodes: props.navo.authedNodes,
    authedIdMap: props.navo.authedIdMap,
    authedRootResolvePath: props.navo.authedRootResolvePath,
  })

  const value: NavoContextProps = {
    originNavo: props.navo,
    get nodes() {
      return state.nodes
    },
    get idMap() {
      return state.idMap
    },
    get authedNodes() {
      return state.authedNodes
    },
    get authedIdMap() {
      return state.authedIdMap
    },
    get authedRootResolvePath() {
      return state.authedRootResolvePath
    },
    onCanAccess: (canAccess?: CanAccess) => {
      props.navo.authenticat(canAccess)
      state.nodes = props.navo.nodes
      state.idMap = props.navo.idMap
      state.authedNodes = props.navo.authedNodes
      state.authedIdMap = props.navo.authedIdMap
      state.authedRootResolvePath = props.navo.authedRootResolvePath
    },
  }

  provide(NavoKey, value)

  return () => slots.default?.()
}

/** 使用 Navo Context（内部使用） */
export function useNavoContext(): NavoContextProps {
  const navo = inject(NavoKey)
  if (!navo) throw new Error('useNavoContext must be used within a NavoProvider.')
  return navo
}

/** 生成 vue-router routes */
export function generateRoutes<T extends NavoNodeInput[]>(navo: Navo<T>): RouteRecordRaw[] {
  const navNodes = navo.nodes
  const r = (navNodes: NavoNode[]): RouteRecordRaw[] => {
    const routes: RouteRecordRaw[] = []
    for (let i = 0; i < navNodes.length; i++) {
      const navNode = navNodes[i]
      const route = {
        ...navNode.route,
        name: navNode.id,
        path: navNode.originPath ?? '',
      } as RouteRecordRaw
      if (navNode.children?.length) {
        route.children = r(navNode.children)
      }
      routes.push(route)
    }

    if (navNodes.length) {
      routes.push({
        path: '',
        redirect: () => {
          const parentNode = navNodes[0].parent
          if (parentNode) {
            const resolved = navo.authedIdMap.get(parentNode.id)
            if (resolved) return resolved.path
          }
          return navo.authedRootResolvePath
        },
      })
    }
    return routes
  }

  return r(navNodes)
}
