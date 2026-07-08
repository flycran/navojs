import { Navo, type NavoNode } from '@navojs/core'
import { useContext, useMemo } from 'react'
import { useMatches } from 'react-router'
import { NavoContext } from './main'

/**
 * 鉴权回调
 * @example
 * ```ts
 * const onCanAccess = useCanAccess()
 * useEffect(() => {
 *   onCanAccess((node) => {
 *     return accessList.includes(node.id)
 *   })
 * }, [])
 * ```
 */
export const useCanAccess = () => {
  const navo = useContext(NavoContext)
  if (!navo) throw new Error('useCanAccess must be used within a NavoProvider.')
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
export const useMatchedNodes = () => {
  const navo = useContext(NavoContext)
  if (!navo) throw new Error('useCurrentNode must be used within a NavoProvider.')
  const matches = useMatches()

  return useMemo(() => {
    const matchedNodes: NavoNode[] = []
    const matchedIds: string[] = []
    for (let i = matches.length - 1; i >= 0; i--) {
      const element = matches[i]
      const node = navo.authedIdMap.get(element.id)

      if (node && !Navo.isAffiliated(node)) {
        matchedNodes.push(node)
        matchedIds.push(node.id)
      }
    }

    return {
      matchedNodes: matchedNodes.reverse(),
      matchedIds: matchedIds.reverse(),
    }
  }, [matches, navo.authedIdMap])
}

export type UseNavoReturn = {
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
export const useNavo = (): UseNavoReturn => {
  const navo = useContext(NavoContext)
  if (!navo) throw new Error('useNavoIdMap must be used within a NavoProvider.')

  return {
    nodes: navo.authedNodes,
    getNodeById: (id: string) => navo.authedIdMap.get(id),
    getPathById: (id: string) => navo.authedIdMap.get(id)?.path,
    hasCanAccess: (id: string) => navo.authedIdMap.has(id),
  }
}
