import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import Layout from '@/layouts/Layout'
import About from '@/pages/About'
import Dashboard from '@/pages/Dashboard'
import DocApi from '@/pages/DocApi'
import DocFaq from '@/pages/DocFaq'
import DocGuide from '@/pages/DocGuide'
import Monitor from '@/pages/Monitor'
import Permissions from '@/pages/Permissions'
import UserDetail from '@/pages/UserDetail'
import UserList from '@/pages/UserList'

// 根路由
const rootRoute = createRootRoute({
  component: Layout,
})

// 系统管理路由组
const systemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'system',
})

const permissionsRoute = createRoute({
  getParentRoute: () => systemRoute,
  path: 'permissions',
  component: Permissions,
})

const usersRoute = createRoute({
  getParentRoute: () => systemRoute,
  path: 'users',
})

const userListRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'list',
  component: UserList,
})

const userDetailRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '$id',
  component: UserDetail,
})

// users 的默认重定向
const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/system/users/list' })
  },
})

// 工作台路由组
const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'workspace',
})

const dashboardRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: 'dashboard',
  component: Dashboard,
})

const monitorRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: 'monitor',
  component: Monitor,
})

const documentsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: 'documents',
})

const docGuideRoute = createRoute({
  getParentRoute: () => documentsRoute,
  path: 'guide',
  component: DocGuide,
})

const docApiRoute = createRoute({
  getParentRoute: () => documentsRoute,
  path: 'api',
  component: DocApi,
})

const docFaqRoute = createRoute({
  getParentRoute: () => documentsRoute,
  path: 'faq',
  component: DocFaq,
})

// documents 的默认重定向到 guide
const documentsIndexRoute = createRoute({
  getParentRoute: () => documentsRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/workspace/documents/guide' })
  },
})

// 关于页面
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: About,
})

// 根路径重定向
const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/workspace/dashboard' })
  },
})

// 创建路由树
const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  systemRoute.addChildren([
    permissionsRoute,
    usersRoute.addChildren([usersIndexRoute, userListRoute, userDetailRoute]),
  ]),
  workspaceRoute.addChildren([
    dashboardRoute,
    monitorRoute,
    documentsRoute.addChildren([documentsIndexRoute, docGuideRoute, docApiRoute, docFaqRoute]),
  ]),
  aboutRoute,
])

// 创建路由器
const router = createRouter({ routeTree })

// 注册路由类型
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router

// 导出 route 实例供 navigation 使用
export {
  aboutRoute,
  dashboardRoute,
  docApiRoute,
  docFaqRoute,
  docGuideRoute,
  documentsIndexRoute,
  documentsRoute,
  monitorRoute,
  permissionsRoute,
  rootIndexRoute,
  rootRoute,
  systemRoute,
  userDetailRoute,
  userListRoute,
  usersIndexRoute,
  usersRoute,
  workspaceRoute,
}
