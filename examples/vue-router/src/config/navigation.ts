import { createNavo } from '@navo/vue-router'
import About from '../pages/About.vue'
import Dashboard from '../pages/Dashboard.vue'
import DocApi from '../pages/DocApi.vue'
import DocFaq from '../pages/DocFaq.vue'
import DocGuide from '../pages/DocGuide.vue'
import Monitor from '../pages/Monitor.vue'
import Permissions from '../pages/Permissions.vue'
import UserDetail from '../pages/UserDetail.vue'
import UserList from '../pages/UserList.vue'

export const navo = createNavo([
  {
    id: 'system',
    label: '系统管理',
    path: 'system',
    children: [
      {
        id: 'permissions',
        label: '权限管理',
        path: 'permissions',
        route: { component: Permissions },
      },
      {
        id: 'users',
        label: '用户管理',
        path: 'users',
        children: [
          {
            id: 'user-list',
            affiliated: true,
            label: '用户列表',
            path: 'list',
            resolve: 1,
            route: { component: UserList },
          },
          {
            id: 'user-detail',
            affiliated: true,
            label: '用户详情',
            path: ':id',
            route: { component: UserDetail },
          },
        ],
      },
    ],
  },
  {
    id: 'workspace',
    label: '工作台',
    path: 'workspace',
    children: [
      {
        id: 'dashboard',
        label: '数据概览',
        path: 'dashboard',
        route: { component: Dashboard },
      },
      {
        id: 'monitor',
        label: '实时监控',
        path: 'monitor',
        route: { component: Monitor },
      },
      {
        id: 'documents',
        label: '文档中心',
        path: 'documents',
        resolve: 1,
        children: [
          {
            id: 'doc-guide',
            label: '使用指南',
            path: 'guide',
            route: { component: DocGuide },
          },
          {
            id: 'doc-api',
            label: 'API文档',
            path: 'api',
            route: { component: DocApi },
          },
          {
            id: 'doc-faq',
            label: '常见问题',
            path: 'faq',
            route: { component: DocFaq },
          },
        ],
      },
    ],
  },
  {
    id: 'about',
    label: '关于',
    path: 'about',
    route: { component: About },
  },
])
