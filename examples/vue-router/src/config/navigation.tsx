import * as Icon from '@ant-design/icons-vue'
import { createNavo } from '@navo/vue-router'
import type { VNode } from 'vue'
import About from '../pages/About'
import Dashboard from '../pages/Dashboard'
import DocApi from '../pages/DocApi'
import DocFaq from '../pages/DocFaq'
import DocGuide from '../pages/DocGuide'
import Monitor from '../pages/Monitor'
import Permissions from '../pages/Permissions'
import UserDetail from '../pages/UserDetail'
import UserList from '../pages/UserList'

declare module '@navo/vue-router' {
  interface NavoMeta {
    icon?: VNode
  }
}

const i = (IconComp: typeof Icon.SettingOutlined) => <IconComp />

export const navo = createNavo([
  {
    id: 'system',
    label: '系统管理',
    path: 'system',
    meta: { icon: i(Icon.SettingOutlined) },
    children: [
      {
        id: 'permissions',
        label: '权限管理',
        path: 'permissions',
        meta: { icon: i(Icon.LockOutlined) },
        route: { component: Permissions },
      },
      {
        id: 'users',
        label: '用户管理',
        path: 'users',
        meta: { icon: i(Icon.UserOutlined) },
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
    meta: { icon: i(Icon.DesktopOutlined) },
    children: [
      {
        id: 'dashboard',
        label: '数据概览',
        path: 'dashboard',
        meta: { icon: i(Icon.DashboardOutlined) },
        route: { component: Dashboard },
      },
      {
        id: 'monitor',
        label: '实时监控',
        path: 'monitor',
        meta: { icon: i(Icon.MonitorOutlined) },
        route: { component: Monitor },
      },
      {
        id: 'documents',
        label: '文档中心',
        path: 'documents',
        resolve: 1,
        meta: { icon: i(Icon.FolderOutlined) },
        children: [
          {
            id: 'doc-guide',
            label: '使用指南',
            path: 'guide',
            meta: { icon: i(Icon.FileTextOutlined) },
            route: { component: DocGuide },
          },
          {
            id: 'doc-api',
            label: 'API文档',
            path: 'api',
            meta: { icon: i(Icon.FileTextOutlined) },
            route: { component: DocApi },
          },
          {
            id: 'doc-faq',
            label: '常见问题',
            path: 'faq',
            meta: { icon: i(Icon.FileTextOutlined) },
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
    meta: { icon: i(Icon.InfoCircleOutlined) },
    route: { component: About },
  },
])
