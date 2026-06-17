<template>
  <NavoProvider :navo="navo">
    <AccessController />
    <router-view />
  </NavoProvider>
</template>

<script setup lang="ts">
import { NavoProvider, useCanAccess } from '@navo/vue-router'
import { defineComponent, onMounted, watch } from 'vue'
import { navo } from './config/navigation'
import { usePermissions } from './store/permissions'

// 无渲染的鉴权控制组件（必须在 NavoProvider 内部）
const AccessController = defineComponent({
  name: 'AccessController',
  setup() {
    const { enabledIds, initPermissions } = usePermissions()
    const onCanAccess = useCanAccess()

    onMounted(() => {
      initPermissions(navo.nodes)
    })

    watch(enabledIds, (ids) => {
      onCanAccess((node) => ids.has(node.id))
    }, { immediate: true })

    return () => null
  },
})
</script>
