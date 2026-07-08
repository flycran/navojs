import { NavoProvider, useCanAccess } from '@navo/vue-router'
import { defineComponent, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { navo } from './config/navigation'
import { usePermissions } from './store/permissions'

const AccessController = defineComponent({
  name: 'AccessController',
  setup() {
    const { enabledIds, initPermissions } = usePermissions()
    const onCanAccess = useCanAccess()

    onMounted(() => {
      initPermissions(navo.nodes)
      // 初始鉴权
      onCanAccess((node) => enabledIds.value.has(node.id))
    })

    watch(enabledIds, (ids) => {
      onCanAccess((node) => ids.has(node.id))
    })

    return () => null
  },
})

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <NavoProvider navo={navo}>
        <AccessController />
        <RouterView />
      </NavoProvider>
    )
  },
})
