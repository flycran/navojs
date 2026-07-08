import { type CanAccess, getResolvePath, type Navo, type NavoNode, type NavoNodeInput } from '@navo/core'
import { defineComponent, type InjectionKey, inject, provide, reactive, type SlotsType, type VNode } from 'vue'
import type { RouteRecordRaw, RouteRecordSingleViewWithChildren } from 'vue-router'

export type NavRouteEscapeHatch = Omit<RouteRecordSingleViewWithChildren, 'path' | 'name' | 'children'>

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

/** Navo Provider */
export const NavoProvider = defineComponent({
  name: 'NavoProvider',
  props: {
    navo: { type: Object, required: true },
  },
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(props: { navo: Navo<NavoNodeInput[]> }, { slots }) {
    const state = reactive<NavoContextProps>({
      originNavo: props.navo,
      nodes: props.navo.nodes,
      idMap: props.navo.idMap,
      authedNodes: props.navo.authedNodes,
      authedIdMap: props.navo.authedIdMap,
      authedRootResolvePath: props.navo.authedRootResolvePath,
      onCanAccess: (canAccess?: CanAccess) => {
        props.navo.authenticat(canAccess)
        state.nodes = props.navo.nodes
        state.idMap = props.navo.idMap
        state.authedNodes = props.navo.authedNodes
        state.authedIdMap = props.navo.authedIdMap
        state.authedRootResolvePath = props.navo.authedRootResolvePath
      },
    })

    provide(NavoKey, state)

    return () => slots.default?.()
  },
})

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
      // 为有 children 的父路由添加 index redirect
      // 每次导航时动态计算，因为鉴权结果会变化
      routes.push({
        name: `${navNodes[0].parent?.id ?? 'root'}-index`,
        path: '',
        redirect: () => {
          // 从当前节点的鉴权后子节点中计算 resolve 路径
          const authedChildren = navo.authedIdMap.get(navNodes[0].id)?.children
          return getResolvePath(authedChildren) ?? navNodes[0].path
        },
      })
    }
    return routes
  }

  return r(navNodes)
}
