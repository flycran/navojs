import { Navo, type NavoNode } from '@navo/core'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useNavoContext } from './main'

/**
 * 鉴权回调
 * @example
 * ```ts
 * const onCanAccess = useCanAccess()
 * onCanAccess((node) => {
 *   return accessList.includes(node.id)
 * })
 * ```
 */
export function useCanAccess() {
  const navo = useNavoContext()
  return navo.onCanAccess
}

/**
 * 返回当前活动的节点匹配项
 * @example
 * ```ts
 * const { matchedIds } = useMatchedNodes()
 * const openKeys = matchedIds.slice(0, -1)
 * const selectedKey = matchedIds.at(-1)
 * ```
 */
export function useMatchedNodes() {
  const navo = useNavoContext()
  const route = useRoute()

  return computed(() => {
    const matchedNodes: NavoNode[] = []
    const matchedIds: string[] = []
    // vue-router matched 是从父到子的顺序，需要倒序遍历
    for (let i = route.matched.length - 1; i >= 0; i--) {
      const record = route.matched[i]
      // generateRoutes 将 navo id 映射到了 route name
      const name = record.name as string | undefined
      if (!name) continue
      const node = navo.authedIdMap.get(name)
      if (node && !Navo.isAffiliated(node)) {
        matchedNodes.push(node)
        matchedIds.push(node.id)
      }
    }

    return {
      matchedNodes: matchedNodes.reverse(),
      matchedIds: matchedIds.reverse(),
    }
  })
}

export interface UseNavoReturn {
  /** 已鉴权节点 */
  nodes: NavoNode[]
  /** 根据id获取节点 */
  getNodeById: (id: string) => NavoNode | undefined
  /** 根据id获取路径 */
  getPathById: (id: string) => string | undefined
  /** 判断是否有权限访问该节点 */
  hasCanAccess: (id: string) => boolean
}

/** 获取Navo节点和实用工具 */
export function useNavo(): UseNavoReturn {
  const navo = useNavoContext()

  return reactive({
    get nodes() {
      return navo.authedNodes
    },
    getNodeById: (id: string) => navo.authedIdMap.get(id),
    getPathById: (id: string) => navo.authedIdMap.get(id)?.path,
    hasCanAccess: (id: string) => navo.authedIdMap.has(id),
  }) as UseNavoReturn
}
