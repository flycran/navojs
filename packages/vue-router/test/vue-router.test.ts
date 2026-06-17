import { describe, expect, it } from 'bun:test'
import type { Component } from 'vue'
import { createNavo, generateRoutes } from '../src/index'

describe('generateRoutes', () => {
  it('should generate flat routes', () => {
    const navo = createNavo([
      { id: 'home', path: '/' },
      { id: 'about', path: '/about' },
    ])
    const routes = generateRoutes(navo)

    expect(routes).toHaveLength(3) // 2 routes + 1 index redirect
    expect(routes[0]).toMatchObject({ name: 'home', path: '/' })
    expect(routes[1]).toMatchObject({ name: 'about', path: '/about' })
    expect(routes[2]).toMatchObject({ path: '' })
    expect(routes[2].name).toBeString()
    expect(routes[2].redirect).toBeFunction()
  })

  it('should generate nested routes with children', () => {
    const navo = createNavo([
      {
        id: 'dashboard',
        path: '/dashboard',
        children: [
          { id: 'overview', path: 'overview' },
          { id: 'settings', path: 'settings' },
        ],
      },
    ])
    const routes = generateRoutes(navo)

    expect(routes).toHaveLength(2) // 1 route + 1 index redirect
    expect(routes[0]).toMatchObject({ name: 'dashboard', path: '/dashboard' })
    expect(routes[0].children).toHaveLength(3) // 2 children + 1 index redirect
    expect(routes[0].children?.[0]).toMatchObject({ name: 'overview', path: 'overview' })
    expect(routes[0].children?.[1]).toMatchObject({ name: 'settings', path: 'settings' })
    expect(routes[0].children?.[2]).toMatchObject({ path: '' })
    expect(routes[0].children?.[2].redirect).toBeFunction()
  })

  it('should preserve route escape hatch properties', () => {
    const DummyComponent: Component = {}
    const navo = createNavo([
      {
        id: 'home',
        path: '/',
        route: {
          component: DummyComponent,
          meta: { title: 'Home' },
        },
      },
    ])
    const routes = generateRoutes(navo)

    expect(routes[0].component).toBe(DummyComponent)
    expect(routes[0].meta).toEqual({ title: 'Home' })
  })

  it('should handle nodes without explicit path', () => {
    const navo = createNavo([{ id: 'root' }])
    const routes = generateRoutes(navo)

    expect(routes).toHaveLength(2) // 1 route + 1 index redirect
    expect(routes[0]).toMatchObject({ name: 'root', path: '' })
  })

  it('should generate index redirect pointing to parent resolve path', () => {
    const navo = createNavo([
      {
        id: 'parent',
        path: '/parent',
        children: [
          { id: 'child-1', path: 'child-1', resolve: 2 },
          { id: 'child-2', path: 'child-2', resolve: 1 },
        ],
      },
    ])
    // 先鉴权让 authedRootResolvePath 生效
    navo.authenticat(() => true)
    const routes = generateRoutes(navo)

    // 父级 index redirect
    expect(routes[1]).toMatchObject({ path: '' })
    expect(routes[1].redirect).toBeFunction()
    // 子级 index redirect
    expect(routes[0].children?.[2]).toMatchObject({ path: '' })
    expect(routes[0].children?.[2].redirect).toBeFunction()
  })
})
