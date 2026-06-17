import { useMatchedNodes, useNavo } from '@navo/tanstack-react-router'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { Layout as AntLayout, Menu } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const { Header, Sider, Content } = AntLayout

export default function Layout() {
  const navigate = useNavigate()
  const { nodes, getPathById } = useNavo()
  const { matchedNodes, matchedIds } = useMatchedNodes()
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const activeNav = matchedNodes[0]
  const sidebarNodes = activeNav?.children ?? []

  // 当路由变化时，自动展开当前匹配的父菜单
  useEffect(() => {
    setOpenKeys(matchedIds.slice(0, -1))
  }, [matchedIds])

  const menuItems = useMemo(
    () =>
      sidebarNodes.map((n) => ({
        key: n.id,
        icon: n.meta?.icon,
        label: n.label,
        children: n.children?.map((c) => ({ key: c.id, icon: c.meta?.icon, label: c.label })),
      })),
    [sidebarNodes]
  )

  return (
    <AntLayout className="h-screen bg-slate-50">
      <Header className="flex items-center px-0 bg-slate-900 h-16 shrink-0">
        <div className="flex items-center px-6 w-64 shrink-0">
          <h1 className="text-lg font-bold text-white">Navo Demo</h1>
        </div>
        <div className="flex items-center h-full">
          {nodes.map((nav) => {
            const active = activeNav?.id === nav.id
            return (
              <Link
                key={nav.id}
                to={nav.path}
                className={`flex items-center gap-2 px-6 h-full text-sm font-medium border-b-2 transition-colors ${active ? 'text-blue-400 border-blue-400 bg-slate-800' : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800'}`}
              >
                <span className={active ? 'text-blue-400' : 'text-slate-400'}>
                  {nav.meta?.icon}
                </span>
                {nav.label}
              </Link>
            )
          })}
        </div>
      </Header>

      <AntLayout hasSider className="bg-slate-50 overflow-hidden flex-1">
        {sidebarNodes.length > 0 && (
          <Sider width={200} className="bg-white shadow-sm h-full">
            <Menu
              mode="inline"
              selectedKeys={[matchedIds.at(-1) ?? '']}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              items={menuItems}
              onClick={({ key }) => {
                const path = getPathById(key)

                path &&
                  navigate({
                    to: path,
                  })
              }}
              className="border-r-0 h-full"
            />
          </Sider>
        )}
        <Content className="p-6 overflow-auto">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
