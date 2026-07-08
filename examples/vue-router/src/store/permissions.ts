import type { NavoNode } from '@navo/vue-router'
import { Navo } from '@navo/vue-router'
import { computed, reactive } from 'vue'

export interface Permission {
  id: string
  label: string
  enabled: boolean
}

const state = reactive({
  permissions: [] as Permission[],
})

export function usePermissions() {
  const enabledIds = computed(() => {
    const ids = new Set<string>(['permissions'])
    state.permissions.forEach((p) => {
      if (p.enabled) ids.add(p.id)
    })
    return ids
  })

  const togglePermission = (id: string) => {
    const p = state.permissions.find((p) => p.id === id)
    if (p) p.enabled = !p.enabled
  }

  const initPermissions = (nodes: NavoNode[]) => {
    const extract = (list: NavoNode[]): Permission[] =>
      list.flatMap((n) => {
        if (n.id === 'permissions') return []
        if (Navo.isMenu(n)) return [{ id: n.id, label: n.label || n.id, enabled: true }]
        return n.children ? extract(n.children) : []
      })
    state.permissions = extract(nodes)
  }

  const enableAll = () => {
    state.permissions.forEach((p) => (p.enabled = true))
  }

  const disableAll = () => {
    state.permissions.forEach((p) => (p.enabled = false))
  }

  return {
    permissions: computed(() => state.permissions),
    enabledIds,
    togglePermission,
    enableAll,
    disableAll,
    initPermissions,
  }
}
