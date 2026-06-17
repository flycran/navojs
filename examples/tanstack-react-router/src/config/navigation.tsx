import * as Icon from '@ant-design/icons'
import { createNavo } from '@navo/tanstack-react-router'
import type { ReactNode } from 'react'
// 从 router 导入 route 实例
import {
  aboutRoute,
  dashboardRoute,
  docApiRoute,
  docFaqRoute,
  docGuideRoute,
  documentsRoute,
  monitorRoute,
  permissionsRoute,
  systemRoute,
  userDetailRoute,
  userListRoute,
  usersRoute,
  workspaceRoute,
} from '../router'

declare module '@navo/tanstack-react-router' {
  interface NavoMeta {
    icon?: ReactNode
  }
}

const i = (IconComp: React.ComponentType) => <IconComp />

export const navo = createNavo([
  {
    id: systemRoute.id,
    label: '系统管理',
    path: systemRoute.path,
    meta: { icon: i(Icon.SettingOutlined) },
    children: [
      {
        id: permissionsRoute.id,
        label: '权限管理',
        path: permissionsRoute.path,
        meta: { icon: i(Icon.LockOutlined) },
      },
      {
        id: usersRoute.id,
        label: '用户管理',
        path: usersRoute.path,
        meta: { icon: i(Icon.UserOutlined) },
        children: [
          {
            id: userListRoute.id,
            affiliated: true,
            label: '用户列表',
            path: userListRoute.path,
            resolve: 1,
          },
          {
            id: userDetailRoute.id,
            affiliated: true,
            label: '用户详情',
            path: userDetailRoute.path,
          },
        ],
      },
    ],
  },
  {
    id: workspaceRoute.id,
    label: '工作台',
    path: workspaceRoute.path,
    meta: { icon: i(Icon.DesktopOutlined) },
    children: [
      {
        id: dashboardRoute.id,
        label: '数据概览',
        path: dashboardRoute.path,
        meta: { icon: i(Icon.DashboardOutlined) },
      },
      {
        id: monitorRoute.id,
        label: '实时监控',
        path: monitorRoute.path,
        meta: { icon: i(Icon.MonitorOutlined) },
      },
      {
        id: documentsRoute.id,
        label: '文档中心',
        path: documentsRoute.path,
        resolve: 1,
        meta: { icon: i(Icon.FolderOutlined) },
        children: [
          {
            id: docGuideRoute.id,
            label: '使用指南',
            path: docGuideRoute.path,
            meta: { icon: i(Icon.FileTextOutlined) },
          },
          {
            id: docApiRoute.id,
            label: 'API文档',
            path: docApiRoute.path,
            meta: { icon: i(Icon.FileTextOutlined) },
          },
          {
            id: docFaqRoute.id,
            label: '常见问题',
            path: docFaqRoute.path,
            meta: { icon: i(Icon.FileTextOutlined) },
          },
        ],
      },
    ],
  },
  {
    id: aboutRoute.id,
    label: '关于',
    path: aboutRoute.path,
    meta: { icon: i(Icon.InfoCircleOutlined) },
  },
])
