import { describe, expect, it } from 'bun:test'
import { createNavo, getResolvePath, Navo, type TypeKey } from '../src/main'

function getTypes(type?: number) {
  if (!type) return []
  const types: TypeKey[] = []
  Object.entries(Navo.NodeType).forEach(([key, value]) => {
    if (value & type) {
      types.push(key as TypeKey)
    }
  })
  return types
}

describe('buildNavoNodes', () => {
  it('nodes', () => {
    expect(createNavo([]).nodes).toEqual([])
    expect(createNavo([{}]).nodes).toMatchObject([
      {
        id: 'navo-0',
        parent: null,
        originPath: undefined,
        path: '/',
      },
    ])

    expect(createNavo([{}]).nodes[0].type).toBe(Navo.NodeType.page | Navo.NodeType.menu)
  })

  it('basePath ', () => {
    const input = [
      {
        path: 'nav-1',
        children: [
          {
            path: '/menu-1',
          },
          {
            path: 'menu-2',
          },
        ],
      },
    ]
    const outputPath = {
      nav1: '/nav-1',
      menu1: '/menu-1',
      menu2: '/nav-1/menu-2',
    }

    const navo1 = createNavo(input)
    const navo2 = createNavo(input, { basePath: '/' })
    const navo3 = createNavo(input, { basePath: '' })

    expect(navo1.nodes[0].path).toEqual(outputPath.nav1)
    expect(navo1.nodes[0].children?.[0].path).toEqual(outputPath.menu1)
    expect(navo1.nodes[0].children?.[1].path).toEqual(outputPath.menu2)

    expect(navo2.nodes[0].path).toEqual(outputPath.nav1)
    expect(navo2.nodes[0].children?.[0].path).toEqual(outputPath.menu1)
    expect(navo2.nodes[0].children?.[1].path).toEqual(outputPath.menu2)

    expect(navo3.nodes[0].path).toEqual(outputPath.nav1)
    expect(navo3.nodes[0].children?.[0].path).toEqual(outputPath.menu1)
    expect(navo3.nodes[0].children?.[1].path).toEqual(outputPath.menu2)
  })

  it('type', () => {
    const { idMap } = createNavo([
      {
        id: 'nav-1',
        path: 'nav-1',
        children: [
          {
            id: 'menu-1',
            path: '/menu-1',
          },
          {
            id: 'menu-2',
            path: 'menu-2',
            children: [
              {
                id: 'menu-2-1',
                path: 'menu-2-1',
                affiliated: true,
              },
            ],
          },
        ],
      },
      {
        id: 'nav-2',
        path: 'nav-2',
        children: [
          {
            id: 'menu-3',
            path: 'menu-3',
            children: [
              {
                id: 'menu-3-1',
                path: 'menu-3-1',
                affiliated: true,
              },
              {
                id: 'menu-3-2',
                path: 'menu-3-2',
              },
            ],
          },
        ],
      },
    ])

    expect(getTypes(idMap.get('nav-1')?.type)).toEqual(['menuGroup', 'layout'])
    expect(getTypes(idMap.get('nav-2')?.type)).toEqual(['menuGroup', 'layout'])
    expect(getTypes(idMap.get('menu-1')?.type)).toEqual(['menu', 'page'])
    expect(getTypes(idMap.get('menu-2')?.type)).toEqual(['menu', 'layout'])
    expect(getTypes(idMap.get('menu-2-1')?.type)).toEqual(['affiliated', 'page'])
    expect(getTypes(idMap.get('menu-3')?.type)).toEqual(['menuGroup', 'menu', 'layout'])
    expect(getTypes(idMap.get('menu-3-1')?.type)).toEqual(['affiliated', 'page'])
    expect(getTypes(idMap.get('menu-3-2')?.type)).toEqual(['menu', 'page'])
  })

  it('Duplicate id', () => {
    expect(() => createNavo([{ id: 'a' }, { id: 'a' }])).toThrow('Duplicate id: a')
    expect(() => createNavo([{}, { id: 'navo-0' }])).toThrow('Duplicate id: navo-0')
  })
})

describe('getResolvePath', () => {
  it('返回首个', () => {
    expect(
      getResolvePath(
        createNavo([
          {
            path: 'a-1',
            children: [
              {
                path: 'b-1',
              },
              {
                path: 'b-2',
              },
            ],
          },
        ]).nodes[0].children
      )
    ).toBe('/a-1/b-1')
  })

  it('返回最小resolve', () => {
    expect(
      getResolvePath(
        createNavo([
          {
            path: 'a-1',
            children: [
              {
                path: 'b-1',
                resolve: 2,
              },
              {
                path: 'b-2',
                resolve: 1,
              },
            ],
          },
        ]).nodes[0].children
      )
    ).toBe('/a-1/b-2')
  })

  it('负数resolve', () => {
    expect(
      getResolvePath(
        createNavo([
          {
            path: 'a-1',
            children: [
              {
                path: 'b-1',
                resolve: -1,
              },
              {
                path: 'b-2',
                resolve: -2,
              },
            ],
          },
        ]).nodes[0].children
      )
    ).toBe('/a-1/b-2')
  })

  it('混合', () => {
    expect(
      getResolvePath(
        createNavo([
          {
            path: 'a-1',
            children: [
              {
                path: 'b-1',
              },
              {
                path: 'b-2',
                resolve: 2,
              },
              {
                path: 'b-3',
                resolve: 1,
              },
            ],
          },
        ]).nodes[0].children
      )
    ).toBe('/a-1/b-3')
  })
})
