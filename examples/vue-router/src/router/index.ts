import { generateRoutes } from '@navojs/vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { navo } from '../config/navigation'
import Layout from '../layouts/Layout'

const routes = [
  {
    path: '/',
    component: Layout,
    children: generateRoutes(navo),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
