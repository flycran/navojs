import { useMatchedNodes, useNavo } from '@navojs/vue-router'
import { Layout as AntLayout, Menu } from 'ant-design-vue'
import { computed, defineComponent } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const { Header, Sider, Content } = AntLayout

export default defineComponent({
  name: 'Layout',
  setup() {
    const router = useRouter()
    const navo = useNavo()
    const matchedResult = useMatchedNodes()

    const matchedNodes = computed(() => matchedResult.value.matchedNodes)
    const matchedIds = computed(() => matchedResult.value.matchedIds)

    const activeNav = computed(() => matchedNodes.value[0])
    const sidebarNodes = computed(() => activeNav.value?.children ?? [])

    const menuItems = computed(() =>
      sidebarNodes.value.map((n) => ({
        key: n.id,
        icon: n.meta?.icon,
        label: n.label,
        children: n.children?.map((c) => ({ key: c.id, icon: c.meta?.icon, label: c.label })),
      }))
    )

    return () => (
      <AntLayout class="h-screen bg-slate-50">
        <Header class="flex items-center px-0 bg-slate-900 h-16 shrink-0">
          <div class="flex items-center px-6 w-64 shrink-0">
            <h1 class="text-lg font-bold text-white">Navo Demo</h1>
          </div>
          <div class="flex items-center h-full">
            {navo.nodes.map((nav) => {
              const active = activeNav.value?.id === nav.id
              return (
                <RouterLink
                  key={nav.id}
                  to={nav.path}
                  class={`flex items-center gap-2 px-6 h-full text-sm font-medium border-b-2 transition-colors no-underline ${active ? 'text-blue-400 border-blue-400 bg-slate-800' : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800'}`}
                >
                  <span class={active ? 'text-blue-400' : 'text-slate-400'}>
                    {nav.meta?.icon}
                  </span>
                  {nav.label}
                </RouterLink>
              )
            })}
          </div>
        </Header>

        <AntLayout hasSider class="bg-slate-50 overflow-hidden flex-1">
          {sidebarNodes.value.length > 0 && (
            <Sider width={200} class="bg-white shadow-sm h-full">
              <Menu
                mode="inline"
                selectedKeys={[matchedIds.value.at(-1) ?? '']}
                items={menuItems.value}
                onClick={({ key }) => {
                  const path = navo.getPathById(String(key))
                  path && router.push(path)
                }}
                class="border-r-0 h-full"
              />
            </Sider>
          )}
          <Content class="p-6 overflow-auto">
            <RouterView />
          </Content>
        </AntLayout>
      </AntLayout>
    )
  },
})
