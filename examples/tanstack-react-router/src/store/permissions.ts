import type { NavoNode } from '@navo/tanstack-react-router'
import { Navo } from '@navo/tanstack-react-router'
import { atom } from 'jotai'

export type Permission = { id: string; label: string; enabled: boolean }

// 权限状态
export const permissionsAtom = atom<Permission[]>([])

// 已启用的权限ID集合
export const enabledPermissionIdsAtom = atom((get) => {
  const ids = new Set<string>(['/system/permissions'])
  get(permissionsAtom).forEach(p => {p.enabled && ids.add(p.id)})
  return ids
})

// 切换权限
export const togglePermissionAtom = atom(null, (get, set, id: string) => {
  const list = get(permissionsAtom)
  set(permissionsAtom, list.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
})

// 初始化权限（从 navo 节点提取顶层菜单）
export const initPermissionsAtom = atom(null, (_get, set, nodes: NavoNode[]) => {
  const extract = (list: NavoNode[]): Permission[] =>
    list.flatMap(n => {
      if (n.id === '/system/permissions') return []
      if (Navo.isMenu(n)) return [{ id: n.id, label: n.label || n.id, enabled: true }]
      return n.children ? extract(n.children) : []
    })
  set(permissionsAtom, extract(nodes))
})

// 全部启用
export const enableAllPermissionsAtom = atom(null, (get, set) => {
  set(permissionsAtom, get(permissionsAtom).map(p => ({ ...p, enabled: true })))
})

// 全部禁用
export const disableAllPermissionsAtom = atom(null, (get, set) => {
  set(permissionsAtom, get(permissionsAtom).map(p => ({ ...p, enabled: false })))
})
