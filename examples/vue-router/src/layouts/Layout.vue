<template>
  <div class="layout">
    <header class="header">
      <div class="logo">Navo Vue Demo</div>
      <nav class="top-nav">
        <router-link
          v-for="nav in topNodes"
          :key="nav.id"
          :to="nav.path"
          class="top-nav-item"
          active-class="active"
        >
          {{ nav.label }}
        </router-link>
      </nav>
    </header>
    <div class="body">
      <aside v-if="sidebarNodes.length" class="sidebar">
        <router-link
          v-for="node in sidebarNodes"
          :key="node.id"
          :to="node.path"
          class="sidebar-item"
          active-class="active"
        >
          {{ node.label }}
        </router-link>
      </aside>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMatchedNodes, useNavo } from '@navo/vue-router'
import { computed } from 'vue'

const { nodes: topNodes } = useNavo()
const matchedResult = useMatchedNodes()

const activeNav = computed(() => matchedResult.value.matchedNodes[0])
const sidebarNodes = computed(() => activeNav.value?.children ?? [])
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }

.layout { display: flex; flex-direction: column; height: 100vh; }

.header {
  display: flex; align-items: center; height: 56px;
  background: #1e293b; color: #fff; padding: 0 24px; gap: 32px; flex-shrink: 0;
}
.logo { font-size: 18px; font-weight: 700; white-space: nowrap; }
.top-nav { display: flex; height: 100%; }
.top-nav-item {
  display: flex; align-items: center; padding: 0 20px; color: #94a3b8;
  text-decoration: none; font-size: 14px; border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.top-nav-item:hover { color: #e2e8f0; }
.top-nav-item.active { color: #60a5fa; border-bottom-color: #60a5fa; }

.body { display: flex; flex: 1; overflow: hidden; }

.sidebar {
  width: 200px; background: #f8fafc; border-right: 1px solid #e2e8f0;
  padding: 12px 0; overflow-y: auto; flex-shrink: 0;
}
.sidebar-item {
  display: block; padding: 8px 24px; color: #475569; text-decoration: none;
  font-size: 14px; transition: background 0.15s;
}
.sidebar-item:hover { background: #e2e8f0; }
.sidebar-item.active { color: #2563eb; background: #eff6ff; font-weight: 600; }

.content { flex: 1; padding: 24px; overflow-y: auto; }
</style>
