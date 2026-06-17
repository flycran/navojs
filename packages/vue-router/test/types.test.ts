import { describe, expectTypeOf, it } from 'bun:test'
import type { Component } from 'vue'
import { createNavo, generateRoutes } from '../src/index'

describe('generateRoutes', () => {
  it('should generate vue-router routes with correct types', () => {
    const DummyComponent: Component = {}
    const navo = createNavo([
      { id: 'nav-1', path: '/nav-1' },
      {
        id: 'nav-2',
        path: '/nav-2',
        children: [
          {
            id: 'menu-1',
            path: 'menu-1',
            route: {
              component: DummyComponent,
              meta: { title: 'Menu 1' },
            },
          },
        ],
      },
    ])
    const routes = generateRoutes(navo)

    // 验证路由结构
    expectTypeOf(routes).toBeArray()
    expectTypeOf(routes[0].name).toBeString()
    expectTypeOf(routes[0].path).toBeString()

    // 验证 route escape hatch 属性被保留
    const childRoute = routes[1].children?.[0]
    if (childRoute) {
      expectTypeOf(childRoute).toHaveProperty('meta')
    }
  })
})
