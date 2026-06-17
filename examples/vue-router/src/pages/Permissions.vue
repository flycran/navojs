<template>
  <h1>权限管理</h1>
  <p>Permissions 页面</p>
  <ul>
    <li v-for="p in permissions" :key="p.id">
      <label>
        <input type="checkbox" :checked="p.enabled" @change="togglePermission(p.id)" />
        {{ p.label }}
      </label>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { usePermissions } from '../store/permissions'

const { permissions, togglePermission } = usePermissions()
</script>
